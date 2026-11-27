"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft } from "lucide-react";
import { PolicyVaultCard } from "@/components/PolicyVaultCard";
import { TargetInspectorCard } from "@/components/TargetInspectorCard";
import { ExecutionFeedCard } from "@/components/ExecutionFeedCard";
import { isProgramConfigured } from "@/lib/program";
import type { AnalysisResult } from "@/lib/types";

const STACK = [
  { label: "Firecrawl", color: "bg-purple-500" },
  { label: "ElevenLabs", color: "bg-cyan-400" },
  { label: "Anchor", color: "bg-emerald-400" },
  { label: "Supabase", color: "bg-zinc-400" },
];

export default function SolVoxDashboard() {
  const [targetWallet, setTargetWallet] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [amountSol, setAmountSol] = useState("0.25");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [vaultRefresh, setVaultRefresh] = useState(0);

  const programReady = isProgramConfigured();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A1A] text-zinc-100">
      <div className="relative">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/brand/solvox-logo-notag-mono-white.png"
                  alt="SolVox"
                  width={1257}
                  height={440}
                  priority
                  className="h-7 w-auto sm:h-8"
                />
              </Link>
              <span className="hidden h-5 w-px bg-white/10 sm:block" />
              <span className="hidden text-[12px] font-medium text-zinc-400 sm:block">
                Command center
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:border-white/20 hover:text-white sm:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Home
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:inline-flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    programReady ? "bg-[#14F195]" : "bg-amber-400"
                  }`}
                />
                {programReady ? "Program live" : "Program pending"}
              </span>
              <WalletMultiButton />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 pb-16 pt-[104px] sm:px-8 sm:pt-[116px]">
          <section className="mb-8 max-w-3xl">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
              Solana Devnet - Command center
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[40px]">
              Run a guarded action.
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-zinc-400 sm:text-[15px]">
              Set your policy, verify a recipient, and let the program decide
              before a single lamport moves.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {STACK.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-200"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <PolicyVaultCard refreshTrigger={vaultRefresh} />

            <TargetInspectorCard
              targetWallet={targetWallet}
              projectUrl={projectUrl}
              onTargetChange={(w, u) => {
                setTargetWallet(w);
                setProjectUrl(u);
              }}
              onAnalysisComplete={setAnalysis}
              onAmountDetected={setAmountSol}
            />

            <ExecutionFeedCard
              targetWallet={targetWallet}
              projectUrl={projectUrl}
              amountSol={amountSol}
              onAmountChange={setAmountSol}
              analysis={analysis}
              onExecuted={() => setVaultRefresh((n) => n + 1)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
