"use client";

import React, { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ShieldCheck, ShieldAlert, Mic, ExternalLink, Send, Lock } from "lucide-react";

type AnalysisResult = {
  wallet: string;
  projectUrl: string;
  grade: string;
  gradeNumeric: number;
  score: number;
  redFlags: string[];
  washLoopMetrics: {
    walletAgeDays: number;
    txCount: number;
    uniqueCounterparties: number;
    reciprocalRatio: number;
  };
  citations: { title: string; url: string }[];
  attestTxSignature?: string;
};

export default function SolVoxDashboard() {
  const { publicKey } = useWallet();

  // Policy Vault state (wire to Anchor solvox program in T-08)
  const [dailyLimitSol, setDailyLimitSol] = useState("1.0");
  const [minTrustGrade, setMinTrustGrade] = useState("B");
  const [vaultBalanceSol] = useState("0.00");

  // Target Inspector state
  const [targetWallet, setTargetWallet] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [amountSol, setAmountSol] = useState("0.25");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!targetWallet || !projectUrl) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: targetWallet, projectUrl }),
      });
      if (res.ok) {
        setAnalysis(await res.json());
      }
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">SolVox</h1>
              <p className="text-xs text-zinc-400">
                On-Chain Trust &amp; Policy Firewall · Solana Devnet
              </p>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-12">
        {/* Panel 1: Policy Vault Card */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              1. Policy Vault
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Devnet
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-xs text-zinc-400">Vault Balance</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{vaultBalanceSol} SOL</p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              Owner: {publicKey ? publicKey.toBase58() : "Connect Phantom / Solflare"}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Daily Spend Limit (SOL)
              </label>
              <input
                type="number"
                step="0.1"
                value={dailyLimitSol}
                onChange={(e) => setDailyLimitSol(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Minimum Trust Grade
              </label>
              <select
                value={minTrustGrade}
                onChange={(e) => setMinTrustGrade(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="A">Grade A (Strict)</option>
                <option value="B">Grade B (Recommended)</option>
                <option value="C">Grade C (Permissive)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={!publicKey}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Initialize Vault
              </button>
              <button
                type="button"
                disabled={!publicKey}
                className="rounded-lg border border-zinc-700 bg-zinc-800/70 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Deposit 1 SOL
              </button>
            </div>
          </div>
        </section>

        {/* Panel 2: Voice & Target Inspector */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              2. Voice &amp; Target Inspector
            </h2>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 hover:border-emerald-500/50"
            >
              <Mic className="h-3.5 w-3.5 text-emerald-400" />
              Hold to Speak
            </button>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Recipient Wallet (Devnet)
              </label>
              <input
                type="text"
                placeholder="Base58 Solana address..."
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Project Website URL (Firecrawl)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing || !targetWallet || !projectUrl}
              className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {analyzing ? "Investigating Web + On-Chain..." : "Verify & Attest Grade On-Chain"}
            </button>
          </form>

          {analysis && (
            <div className="mt-5 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Trust Grade</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    analysis.gradeNumeric >= 4
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {analysis.gradeNumeric >= 4 ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  )}
                  Grade {analysis.grade} ({analysis.score}/100)
                </span>
              </div>

              {analysis.redFlags.length > 0 && (
                <ul className="space-y-1 text-xs text-red-300">
                  {analysis.redFlags.map((flag, idx) => (
                    <li key={idx}>• {flag}</li>
                  ))}
                </ul>
              )}

              {analysis.citations.length > 0 && (
                <div className="pt-1">
                  <p className="mb-1 text-[11px] font-medium text-zinc-400">Firecrawl Citations</p>
                  {analysis.citations.map((c, idx) => (
                    <a
                      key={idx}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {c.title || c.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Panel 3: Execution & Receipt Feed */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
            3. Guarded Execution &amp; Receipts
          </h2>

          <div className="mb-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Transfer Amount (SOL)
              </label>
              <input
                type="number"
                step="0.05"
                value={amountSol}
                onChange={(e) => setAmountSol(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={!publicKey || !targetWallet}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              Execute Guarded Action
            </button>
          </div>

          <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
            On-chain confirmations, Anchor rejection proofs (`InsufficientTrustGrade`,
            `DailyLimitExceeded`), and Supabase audit receipts will appear here.
          </div>
        </section>
      </main>
    </div>
  );
}
