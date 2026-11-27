"use client";

import React, { useState } from "react";
import { Reveal } from "./Reveal";

type Row = { cat: string; key: string; text: string; sig: string };

const ROWS: Row[] = [
  { cat: "VOICE", key: "voice", text: "Voice command parsed: verify recipient and send 0.25 SOL", sig: "5xQ2...f9Kd" },
  { cat: "TRUST", key: "trust", text: "Trust grade B attested for 8xJk...pQ2f", sig: "3mN7...a1Tz" },
  { cat: "VAULT", key: "vault", text: "PolicyVault initialized with a 1.0 SOL daily cap", sig: "9pR4...k2Lm" },
  { cat: "RECEIPT", key: "receipt", text: "ActionReceipt written for a 0.25 SOL transfer", sig: "7tY6...b3Nc" },
  { cat: "TRUST", key: "trust", text: "Grade F issued: 85 percent wash loop, 2 counterparties", sig: "2fH8...q7Vd" },
  { cat: "VOICE", key: "voice", text: "Hold-to-speak captured an intent in 1.2s", sig: "6bK1...w9Rs" },
  { cat: "VAULT", key: "vault", text: "Owner deposited 1.0 SOL into PolicyVault", sig: "4cD5...m8Xp" },
  { cat: "RECEIPT", key: "receipt", text: "Rejected on-chain: InsufficientTrustGrade", sig: "8gL3...n6Qh" },
  { cat: "TRUST", key: "trust", text: "Attestor refreshed grade A for a clean wallet", sig: "1vB9...t4Yk" },
  { cat: "RECEIPT", key: "receipt", text: "DailyLimitExceeded on a 1.5 SOL request", sig: "3jM2...r5Wf" },
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
  const rows = tab === "all" ? ROWS : ROWS.filter((r) => r.key === tab);

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
              <span className="hidden shrink-0 font-mono text-[11px] text-slate group-hover:text-cloud sm:block">
                {row.sig}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="border-t border-white/10 px-5 py-3">
        <p className="font-mono text-[11px] text-slate">
          <span className="text-mint">$</span> sample feed, live once the app is
          connected<span className="blink ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-mint" />
        </p>
      </div>
    </div>
  );
}