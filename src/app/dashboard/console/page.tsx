"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SideRail, MobileNav } from "@/components/dashboard/SideRail";
import { ProfileRail } from "@/components/dashboard/ProfileRail";
import { PolicyVaultCard } from "@/components/PolicyVaultCard";
import { TargetInspectorCard } from "@/components/TargetInspectorCard";
import { ExecutionFeedCard } from "@/components/ExecutionFeedCard";
import type { AnalysisResult, PolicyVaultData } from "@/lib/types";

export default function SolVoxConsolePage() {
  const [vault, setVault] = useState<PolicyVaultData | null>(null);
  const [targetWallet, setTargetWallet] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [amountSol, setAmountSol] = useState("0.25");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [vaultRefresh, setVaultRefresh] = useState(0);
  const [executeSignal, setExecuteSignal] = useState(0);

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 md:pl-[76px]">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <SideRail />
      <MobileNav />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-12">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#14F195]">
                  Solana Devnet · Guard Console
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Vault, Inspect &amp; Execute
                </h1>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Overview
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div id="vault" data-tour="policy-vault">
                <PolicyVaultCard
                  onVaultChange={setVault}
                  refreshTrigger={vaultRefresh}
                />
              </div>

              <div id="inspect" data-tour="target-inspector">
                <TargetInspectorCard
                  targetWallet={targetWallet}
                  projectUrl={projectUrl}
                  onTargetChange={(w, u) => {
                    setTargetWallet(w);
                    setProjectUrl(u);
                  }}
                  onAnalysisComplete={setAnalysis}
                  onAmountDetected={setAmountSol}
                  onRequestExecute={() => setExecuteSignal((n) => n + 1)}
                />
              </div>

              <div id="execute" data-tour="guarded-execution">
                <ExecutionFeedCard
                  targetWallet={targetWallet}
                  projectUrl={projectUrl}
                  amountSol={amountSol}
                  onAmountChange={setAmountSol}
                  analysis={analysis}
                  executeSignal={executeSignal}
                  onExecuted={() => setVaultRefresh((n) => n + 1)}
                />
              </div>
            </div>
          </div>

          <aside>
            <ProfileRail vault={vault} />
          </aside>
        </div>
      </div>
    </div>
  );
}
