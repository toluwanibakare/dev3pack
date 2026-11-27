"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SideRail, MobileNav } from "@/components/dashboard/SideRail";
import { WelcomeHero } from "@/components/dashboard/WelcomeHero";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { ProfileRail } from "@/components/dashboard/ProfileRail";
import { fetchPolicyVault } from "@/lib/program";
import type { PolicyVaultData, ReceiptLogItem } from "@/lib/types";

export default function SolVoxDashboard() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [vault, setVault] = useState<PolicyVaultData | null>(null);
  const [receipts, setReceipts] = useState<ReceiptLogItem[]>([]);

  const loadVault = useCallback(async () => {
    if (!publicKey) {
      setVault(null);
      return;
    }
    try {
      const data = await fetchPolicyVault(connection, publicKey);
      setVault(data);
    } catch {
      // Ignore transient RPC errors on overview
    }
  }, [connection, publicKey]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  useEffect(() => {
    fetch("/api/receipts")
      .then((r) => (r.ok ? r.json() : { receipts: [] }))
      .then((d) => {
        if (Array.isArray(d.receipts)) setReceipts(d.receipts);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 md:pl-[76px]">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <SideRail />
      <MobileNav />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-8 sm:px-8 md:pb-12">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-7">
            <WelcomeHero name="friend" />

            <section id="overview" data-tour="overview-stats">
              <OverviewStats vault={vault} receipts={receipts} analysis={null} />
            </section>
          </div>

          <aside>
            <ProfileRail vault={vault} />
          </aside>
        </div>
      </div>
    </div>
  );
}
