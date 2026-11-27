"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { ExternalLink, RefreshCw, Shield, Wallet } from "lucide-react";
import { explorerTxUrl, gradeToLabel, GRADE_VALUES, truncateAddress } from "@/lib/constants";
import {
  buildDepositVaultIx,
  buildInitializeVaultIx,
  buildUpdatePolicyIx,
  buildWithdrawVaultIx,
  fetchPolicyVault,
  parseSolVoxError,
} from "@/lib/program";
import { PolicyVaultData } from "@/lib/types";

interface PolicyVaultCardProps {
  onVaultChange?: (vault: PolicyVaultData | null) => void;
  refreshTrigger?: number;
}

export function PolicyVaultCard({ onVaultChange, refreshTrigger }: PolicyVaultCardProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [vault, setVault] = useState<PolicyVaultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const [dailyLimitSol, setDailyLimitSol] = useState("1.0");
  const [minTrustGrade, setMinTrustGrade] = useState("B");
  const [depositAmountSol, setDepositAmountSol] = useState("0.5");

  const loadVault = useCallback(async () => {
    if (!publicKey) {
      setVault(null);
      onVaultChange?.(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPolicyVault(connection, publicKey);
      setVault(data);
      onVaultChange?.(data);
      if (data) {
        setDailyLimitSol((Number(data.dailySpendLimitLamports) / LAMPORTS_PER_SOL).toString());
        setMinTrustGrade(gradeToLabel(data.minTrustGrade));
      }
    } catch (err) {
      console.error("Failed to fetch vault:", err);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, onVaultChange]);

  useEffect(() => {
    loadVault();
  }, [loadVault, refreshTrigger]);

  async function runTx(label: string, buildIx: () => Promise<ReturnType<typeof buildDepositVaultIx> extends Promise<infer T> ? T : never>) {
    if (!publicKey) return;
    setBusy(label);
    setError(null);
    setLastTx(null);
    try {
      const ix = await buildIx();
      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setLastTx(sig);
      await loadVault();
    } catch (err) {
      setError(parseSolVoxError(err));
    } finally {
      setBusy(null);
    }
  }

  const vaultSol = vault ? (vault.lamports / LAMPORTS_PER_SOL).toFixed(4) : "0.0000";
  const spentSol = vault ? Number(vault.spentTodayLamports) / LAMPORTS_PER_SOL : 0;
  const limitSol = vault ? Number(vault.dailySpendLimitLamports) / LAMPORTS_PER_SOL : 0;
  const spentPct = limitSol > 0 ? Math.min(100, Math.round((spentSol / limitSol) * 100)) : 0;

  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#111119] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400">Policy vault</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadVault}
            disabled={!publicKey || loading}
            className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:text-white disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>
          <Shield className="h-4 w-4 text-zinc-500" />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Vault Balance</span>
          {vault ? (
            <span className="rounded-full bg-[#14F195]/15 px-2 py-0.5 text-[10px] font-semibold text-[#14F195]">
              Active PDA
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              Not Initialized
            </span>
          )}
        </div>

        <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
          {vaultSol} <span className="text-sm font-normal text-zinc-400">SOL</span>
        </p>

        <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          <Wallet className="h-3 w-3" />
          {publicKey ? truncateAddress(publicKey.toBase58(), 6) : "Connect Phantom / Solflare"}
        </p>

        {vault && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Spent Today</span>
              <span className="font-mono tabular-nums text-zinc-200">
                {spentSol.toFixed(3)} / {limitSol.toFixed(3)} SOL
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9945FF] via-[#00D1FF] to-[#14F195] transition-all"
                style={{ width: `${spentPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Daily Spend Limit (SOL)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.01"
            value={dailyLimitSol}
            onChange={(e) => setDailyLimitSol(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 font-mono text-sm text-white focus:border-[#00D1FF] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Minimum Trust Grade
          </label>
          <select
            value={minTrustGrade}
            onChange={(e) => setMinTrustGrade(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 text-sm text-white focus:border-[#00D1FF] focus:outline-none"
          >
            <option value="A">Grade A (Strict — 5)</option>
            <option value="B">Grade B (Recommended — 4)</option>
            <option value="C">Grade C (Permissive — 3)</option>
          </select>
        </div>

        {!vault ? (
          <button
            type="button"
            disabled={!publicKey || !!busy}
            onClick={() =>
              runTx("init", () =>
                buildInitializeVaultIx(
                  publicKey!,
                  BigInt(Math.round(Number(dailyLimitSol) * LAMPORTS_PER_SOL)),
                  GRADE_VALUES[minTrustGrade] ?? 4,
                  publicKey!
                )
              )
            }
            className="mt-1 w-full rounded-full bg-[#14F195] px-4 py-2.5 text-xs font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === "init" ? "Initializing Vault..." : "Initialize PolicyVault"}
          </button>
        ) : (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!publicKey || !!busy}
                onClick={() =>
                  runTx("update", () =>
                    buildUpdatePolicyIx(
                      publicKey!,
                      BigInt(Math.round(Number(dailyLimitSol) * LAMPORTS_PER_SOL)),
                      GRADE_VALUES[minTrustGrade] ?? 4,
                      vault.paused
                    )
                  )
                }
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                {busy === "update" ? "Updating..." : "Update Rules"}
              </button>
              <button
                type="button"
                disabled={!publicKey || !!busy}
                onClick={() =>
                  runTx("pause", () =>
                    buildUpdatePolicyIx(
                      publicKey!,
                      vault.dailySpendLimitLamports,
                      vault.minTrustGrade,
                      !vault.paused
                    )
                  )
                }
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-40 ${
                  vault.paused
                    ? "border-[#14F195]/40 bg-[#14F195]/15 text-[#14F195]"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15"
                }`}
              >
                {busy === "pause" ? "..." : vault.paused ? "Resume Vault" : "Pause Vault"}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0.05"
                value={depositAmountSol}
                onChange={(e) => setDepositAmountSol(e.target.value)}
                className="w-24 rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 font-mono text-xs text-white focus:border-[#14F195] focus:outline-none"
              />
              <button
                type="button"
                disabled={!publicKey || !!busy}
                onClick={() =>
                  runTx("deposit", () =>
                    buildDepositVaultIx(
                      publicKey!,
                      BigInt(Math.round(Number(depositAmountSol) * LAMPORTS_PER_SOL))
                    )
                  )
                }
                className="flex-1 rounded-xl bg-[#14F195] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#14F195]/90 disabled:opacity-40"
              >
                {busy === "deposit" ? "Depositing..." : "Deposit SOL"}
              </button>
              <button
                type="button"
                disabled={!publicKey || !!busy || vault.lamports <= 2_000_000}
                onClick={() =>
                  runTx("withdraw", () =>
                    buildWithdrawVaultIx(
                      publicKey!,
                      BigInt(Math.round(Number(depositAmountSol) * LAMPORTS_PER_SOL))
                    )
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                {busy === "withdraw" ? "..." : "Withdraw"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {lastTx && (
          <a
            href={explorerTxUrl(lastTx)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#14F195]/30 bg-[#14F195]/10 px-3 py-2 text-xs text-[#14F195] hover:underline"
          >
            <span>Confirmed on Devnet</span>
            <span className="inline-flex items-center gap-1 font-mono">
              {truncateAddress(lastTx)} <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        )}
      </div>
    </section>
  );
}
