"use client";

import React, { useEffect, useState } from "react";
import { explorerTxUrl, truncateAddress } from "@/lib/constants";
import type { ReceiptLogItem } from "@/lib/types";
import { Reveal } from "./Reveal";

type Row = { cat: string; key: string; text: string; sig: string; href?: string };

const FALLBACK_ROWS: Row[] = [
  { cat: "TRUST", key: "trust", text: "Attestor writes Grade A-F to TrustEntry PDA on Devnet", sig: "GQqU...RNjc" },
  { cat: "VAULT", key: "vault", text: "PolicyVault enforces daily SOL cap & minimum Trust Grade", sig: "Devnet PDA" },
  { cat: "VOICE", key: "voice", text: "ElevenLabs Scribe parses intent & speaks live verdict", sig: "TTS/STT" },
  { cat: "RECEIPT", key: "receipt", text: "Allowed transfers settle and record ActionReceipt PDAs", sig: "Solana" },
  { cat: "RECEIPT", key: "receipt", text: "Blocked targets revert on-chain with InsufficientTrustGrade", sig: "0x1774" },
];

const TABS = [
  { label: "All", key: "all" },
  { label: "Voice", key: "voice" },
  { label: "Trust", key: "trust" },
  { label: "Vaults", key: "vault" },
  { label: "Receipts", key: "receipt" },
];

export function TerminalFeed() {
  const [tab, setTab] = useState("all");
  const [liveRows, setLiveRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/receipts")
      .then((r) => (r.ok ? r.json() : { receipts: [] }))
      .then((d) => {
        if (!Array.isArray(d.receipts) || d.receipts.length === 0) return;
        const mapped: Row[] = (d.receipts as ReceiptLogItem[]).slice(0, 8).map((r) => ({
          cat: r.status === "CONFIRMED" ? "RECEIPT" : "BLOCKED",
          key: "receipt",
          text:
            r.status === "CONFIRMED"
              ? `Confirmed ${r.amountSol} SOL to ${truncateAddress(r.targetWallet)} (Grade ${r.grade})`
              : `Blocked ${r.amountSol} SOL to ${truncateAddress(r.targetWallet)} (${r.grade}) — ${r.errorReason || "Policy rejected"}`,
          sig: r.txSignature ? truncateAddress(r.txSignature, 4) : "Pre-flight",
          href: r.txSignature ? explorerTxUrl(r.txSignature) : undefined,
        }));
        setLiveRows(mapped);
      })
      .catch(() => {});
  }, []);

  const sourceRows = liveRows.length > 0 ? liveRows : FALLBACK_ROWS;
  const rows = tab === "all" ? sourceRows : sourceRows.filter((r) => r.key === tab);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger/80" />
          <span className="h-2 w-2 rounded-full bg-amber/80" />
          <span className="h-2 w-2 rounded-full bg-mint/80" />
          <span className="ml-2 font-mono text-[11px] text-slate">
            solvox ~ activity
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                tab === t.key
                  ? "brand-gradient text-void"
                  : "border border-white/10 bg-white/5 text-slate hover:text-cloud"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {rows.map((row, index) => (
          <Reveal key={`${row.text}-${index}`} delay={index * 70}>
            <div className="group flex items-center gap-4 px-5 py-3 transition hover:bg-white/[0.03]">
              <span className="font-mono text-[11px] text-slate/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan/80">
                {row.cat}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] text-cloud/85">
                {row.text}
              </span>
              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden shrink-0 font-mono text-[11px] text-[#14F195] hover:underline sm:block"
                >
                  {row.sig}
                </a>
              ) : (
                <span className="hidden shrink-0 font-mono text-[11px] text-slate group-hover:text-cloud sm:block">
                  {row.sig}
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[11px] text-slate">
          <span className="text-mint">$</span>{" "}
          {liveRows.length > 0
            ? "live devnet receipts synced from Supabase action_receipts"
            : "devnet protocol activity — open /dashboard/console to run live"}
          <span className="blink ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-mint" />
        </p>
      </div>
    </div>
  );
}