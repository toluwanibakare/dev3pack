"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SideRail, MobileNav } from "@/components/dashboard/SideRail";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { ProfileRail } from "@/components/dashboard/ProfileRail";
import { PolicyVaultCard } from "@/components/PolicyVaultCard";
import { TargetInspectorCard } from "@/components/TargetInspectorCard";
import { ExecutionFeedCard } from "@/components/ExecutionFeedCard";
import { isProgramConfigured } from "@/lib/program";
import { truncateAddress } from "@/lib/constants";
import type { AnalysisResult, PolicyVaultData, ReceiptLogItem } from "@/lib/types";

export default function SolVoxDashboard() {
  const { publicKey } = useWallet();

  const [vault, setVault] = useState<PolicyVaultData | null>(null);
  const [receipts, setReceipts] = useState<ReceiptLogItem[]>([]);
  const [targetWallet, setTargetWallet] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [amountSol, setAmountSol] = useState("0.25");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [vaultRefresh, setVaultRefresh] = useState(0);

  const programReady = isProgramConfigured();
  const address = publicKey?.toBase58() ?? "";
  const name = address ? truncateAddress(address, 4) : "friend";

  useEffect(() => {
    let alive = true;
    fetch("/api/receipts")
      .then((r) => (r.ok ? r.json() : { receipts: [] }))
      .then((d) => {
        if (alive && Array.isArray(d.receipts)) setReceipts(d.receipts);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [vaultRefresh]);

  return (
    <div className="min-h-screen bg-[#08080F] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_520px_at_18%_-12%,rgba(153,69,255,0.12),transparent_62%),radial-gradient(900px_420px_at_92%_0%,rgba(0,209,255,0.08),transparent_60%)]" />

      <SideRail />
      <MobileNav />

      <div className="relative md:pl-[76px]">
        <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 md:hidden">
                <Image
                  src="/brand/solvox-logo-notag-mono-white.png"
                  alt="SolVox"
                  width={1257}
                  height={440}
                  priority
                  className="h-6 w-auto"
                />
              </Link>
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-[13px] font-semibold text-white">Command center</span>
                <span className="h-3.5 w-px bg-white/10" />
                <span className="text-[11px] text-zinc-500">Devnet</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:border-white/20 hover:text-white sm:inline-flex"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Home
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 sm:inline-flex">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    programReady ? "bg-mint" : "bg-amber-400"
                  }`}
                />
                {programReady ? "Program live" : "Program pending"}
              </span>
              <WalletMultiButton className="!h-9 !rounded-full !border !border-white/10 !bg-none !bg-[#111119] !px-4 !text-[12px] !font-semibold !text-white transition hover:!border-white/20 hover:!bg-[#1A1A28]" />
            </div>
          </header>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0">
              <section id="overview" className="scroll-mt-6">
                <WelcomeHero name={name} />
                <OverviewStats vault={vault} receipts={receipts} analysis={analysis} />
              </section>

              <div className="mt-10 mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-bold tracking-tight text-white">The console</h2>
                <a
                  href="https://github.com/toluwanibakare/dev3pack/blob/main/README.md"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition hover:text-white"
                >
                  How it works
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-5">
                <section id="vault" className="scroll-mt-6">
                  <PolicyVaultCard onVaultChange={setVault} refreshTrigger={vaultRefresh} />
                </section>

                <section id="inspect" className="scroll-mt-6">
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
                </section>

                <section id="execute" className="scroll-mt-6">
                  <ExecutionFeedCard
                    targetWallet={targetWallet}
                    projectUrl={projectUrl}
                    amountSol={amountSol}
                    onAmountChange={setAmountSol}
                    analysis={analysis}
                    onExecuted={() => setVaultRefresh((n) => n + 1)}
                    onReceipt={(receipt) => setReceipts((prev) => [receipt, ...prev])}
                  />
                </section>
              </div>
            </main>

            <aside className="xl:sticky xl:top-5 xl:h-fit">
              <ProfileRail vault={vault} />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}