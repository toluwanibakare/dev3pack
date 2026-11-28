"use client";

import React, { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Clock3, ExternalLink, ShieldCheck } from "lucide-react";
import { explorerAddressUrl, explorerTxUrl, GRADE_VALUES, gradeToLabel, truncateAddress } from "@/lib/constants";
import { getTrustEntryPda } from "@/lib/pda";
import { PublicKey } from "@solana/web3.js";
import type { AnalysisResult, PolicyVaultData, ReceiptLogItem } from "@/lib/types";

const LAMPORTS = 1_000_000_000;
const LETTERS = ["A", "B", "C", "D", "F"] as const;

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#111119] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function CardHead({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[13px] font-semibold text-zinc-200">{title}</h3>
      {icon ? <span className="text-zinc-500">{icon}</span> : null}
    </div>
  );
}

function SpendRing({ pct }: { pct: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
  const stroke = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#14F195";

  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={stroke} />
            <stop offset="100%" stopColor="#00D1FF" />
          </linearGradient>
        </defs>
        <circle cx="58" cy="58" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <circle
          cx="58"
          cy="58"
          r={radius}
          fill="none"
          stroke="url(#spendGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-extrabold leading-none tracking-tight text-white">
          {pct}%
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          used
        </span>
      </div>
    </div>
  );
}

export function OverviewStats({
  vault,
  receipts,
  analysis,
}: {
  vault: PolicyVaultData | null;
  receipts: ReceiptLogItem[];
  analysis: AnalysisResult | null;
}) {
  const now = useNow();

  const spent = vault ? Number(vault.spentTodayLamports) / LAMPORTS : 0;
  const limit = vault ? Number(vault.dailySpendLimitLamports) / LAMPORTS : 0;
  const balance = vault ? (vault.lamports / LAMPORTS) : 0;
  const remaining = Math.max(0, limit - spent);
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

  const resetTargetMs = vault
    ? (vault.lastResetTs + 86_400) * 1000
    : (() => {
        const d = new Date();
        d.setUTCHours(24, 0, 0, 0);
        return d.getTime();
      })();
  const msLeft = Math.max(0, resetTargetMs - (now?.getTime() ?? resetTargetMs));
  const hoursLeft = Math.max(0, Math.floor(msLeft / 3_600_000));
  const minsLeft = Math.max(0, Math.floor((msLeft % 3_600_000) / 60_000));

  const requiredGrade = vault ? vault.minTrustGrade : 4;

  const days = now
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const key = d.toDateString();
        const count = receipts.filter(
          (r) => new Date(r.createdAt).toDateString() === key
        ).length;
        return { label: d.toLocaleDateString("en-US", { weekday: "narrow" }), count };
      })
    : Array.from({ length: 7 }, () => ({ label: "", count: 0 }));
  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const confirmed = receipts.filter((r) => r.status === "CONFIRMED").length;
  const blocked = receipts.length - confirmed;

  return (
    <div>
      <div className="mb-4 mt-8 flex items-end justify-between">
        <h2 className="text-[22px] font-bold tracking-tight text-white">My dashboard</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
          Live from devnet
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHead title="Spend today" icon={<Activity className="h-4 w-4" />} />
          <div className="flex items-center gap-5">
            <SpendRing pct={pct} />
            <div className="min-w-0">
              <p className="text-[22px] font-extrabold leading-none tracking-tight text-white">
                {spent.toFixed(4)}
                <span className="ml-1 text-[11px] font-semibold text-zinc-500">SOL</span>
              </p>
              <p className="mt-1.5 text-[11px] text-zinc-500">
                of {limit > 0 ? limit.toFixed(2) : "0.00"} SOL daily cap
              </p>
              <span
                className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  vault?.paused
                    ? "bg-amber-400/15 text-amber-300"
                    : "bg-mint/10 text-mint"
                }`}
              >
                {vault?.paused ? "Vault paused" : vault ? "Within policy" : "No vault yet"}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Daily allowance" icon={<Clock3 className="h-4 w-4" />} />
          <p className="text-[30px] font-extrabold leading-none tracking-tight text-white">
            {remaining.toFixed(4)}
            <span className="ml-1.5 text-[12px] font-semibold text-zinc-500">SOL</span>
          </p>
          <p className="mt-1.5 text-[11px] text-zinc-500">
            {now ? `Resets in ${hoursLeft}h ${minsLeft}m` : "Resets at 00:00 UTC"}
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#14F195,#00D1FF)] transition-[width] duration-700"
              style={{ width: `${limit > 0 ? Math.min(100, (remaining / limit) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Vault balance</span>
            <span className="font-semibold text-zinc-300">{balance.toFixed(4)} SOL</span>
          </div>
        </Card>

        <Card>
          <CardHead title="Trust policy" icon={<ShieldCheck className="h-4 w-4" />} />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/15 text-[15px] font-extrabold text-[#C79BFA]">
              {vault ? gradeToLabel(requiredGrade) : "?"}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-white">
                {vault ? `${gradeToLabel(requiredGrade)} and above allowed` : "Policy not set"}
              </p>
              <p className="text-[11px] text-zinc-500">
                {vault ? "Anything lower reverts on-chain" : "Initialize a vault to arm it"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            {LETTERS.map((letter) => {
              const passes = GRADE_VALUES[letter] >= requiredGrade;
              return (
                <span
                  key={letter}
                  className={`flex h-7 flex-1 items-center justify-center rounded-lg text-[10px] font-bold ${
                    vault && passes
                      ? "bg-mint/10 text-mint"
                      : "bg-white/[0.04] text-zinc-600"
                  }`}
                >
                  {letter}
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Last inspected</span>
            <span className="font-semibold text-zinc-300">
              {analysis ? `${analysis.grade} · ${analysis.score}/100` : "No target yet"}
            </span>
          </div>
        </Card>

        <Card>
          <CardHead
            title="Action receipts"
            icon={<ArrowUpRight className="h-4 w-4" />}
          />
          <div className="relative rounded-xl bg-white/[0.02] px-3 pb-2 pt-3">
            <div className="flex h-[58px] items-end gap-2.5">
              {days.map((day, i) => (
                <div key={i} className="flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-[16px] rounded-[3px] bg-[linear-gradient(180deg,#00D1FF,#9945FF)] transition-[height] duration-700"
                    style={{
                      height: day.count ? `${Math.max(10, (day.count / maxCount) * 100)}%` : "2px",
                      opacity: day.count ? 1 : 0.18,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              {days.map((day, i) => (
                <span
                  key={i}
                  className="flex-1 text-center text-[9px] font-semibold uppercase text-zinc-600"
                >
                  {day.label}
                </span>
              ))}
            </div>
            {receipts.length === 0 ? (
              <span className="pointer-events-none absolute inset-x-0 top-[30px] text-center text-[11px] text-zinc-600">
                No actions logged yet
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              {confirmed} confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              {blocked} blocked
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <CardHead
          title="Recent on-chain receipts (Supabase + Devnet · Native SOL)"
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        {receipts.length === 0 ? (
          <p className="text-xs text-zinc-500">
            No guarded executions recorded yet. Open Guard Console to run a transfer.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {receipts.slice(0, 6).map((r) => {
              let fallbackHref: string | null = null;
              if (!r.txSignature) {
                try {
                  const [pda] = getTrustEntryPda(new PublicKey(r.targetWallet));
                  fallbackHref = explorerAddressUrl(pda.toBase58());
                } catch {
                  fallbackHref = null;
                }
              }
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <span
                      className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        r.status === "CONFIRMED"
                          ? "bg-[#14F195]/15 text-[#14F195]"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {r.status === "CONFIRMED" ? "CONFIRMED" : "BLOCKED"}
                    </span>
                    <span className="font-mono text-zinc-300">
                      {truncateAddress(r.targetWallet)} · Grade {r.grade}
                    </span>
                    {r.errorReason ? (
                      <p className="mt-0.5 truncate text-[11px] text-red-300/90">
                        {r.errorReason}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-semibold text-white">
                      {r.amountSol} SOL
                    </span>
                    {r.txSignature ? (
                      <a
                        href={explorerTxUrl(r.txSignature)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#14F195] hover:underline"
                      >
                        {truncateAddress(r.txSignature, 4)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : fallbackHref ? (
                      <a
                        href={fallbackHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-red-300 hover:underline"
                      >
                        Trust PDA
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}