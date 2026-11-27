"use client";

import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { CheckCircle2, ExternalLink, Send, ShieldBan } from "lucide-react";
import { explorerTxUrl, truncateAddress } from "@/lib/constants";
import { buildExecuteGuardedActionIx, parseSolVoxError } from "@/lib/program";
import { AnalysisResult, ReceiptLogItem } from "@/lib/types";

interface ExecutionFeedCardProps {
  targetWallet: string;
  projectUrl: string;
  amountSol: string;
  onAmountChange: (val: string) => void;
  analysis: AnalysisResult | null;
  onExecuted?: () => void;
  onReceipt?: (receipt: ReceiptLogItem) => void;
}

export function ExecutionFeedCard({
  targetWallet,
  projectUrl,
  amountSol,
  onAmountChange,
  analysis,
  onExecuted,
  onReceipt,
}: ExecutionFeedCardProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [executing, setExecuting] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptLogItem[]>([]);

  useEffect(() => {
    fetch("/api/receipts")
      .then((r) => (r.ok ? r.json() : { receipts: [] }))
      .then((d) => {
        if (Array.isArray(d.receipts)) setReceipts(d.receipts);
      })
      .catch(() => {});
  }, []);

  async function logReceipt(item: ReceiptLogItem) {
    setReceipts((prev) => [item, ...prev]);
    onReceipt?.(item);
    fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        vaultOwner: publicKey?.toBase58(),
        reportId: analysis?.reportId,
      }),
    }).catch(() => {});
  }

  async function handleExecute() {
    if (!publicKey || !targetWallet) return;
    setExecuting(true);
    const amountNum = Number(amountSol);
    const gradeLabel = analysis?.grade || "?";

    try {
      const targetPk = new PublicKey(targetWallet.trim());
      const nonce = BigInt(Date.now());
      const ix = await buildExecuteGuardedActionIx(
        publicKey,
        targetPk,
        publicKey,
        BigInt(Math.round(amountNum * LAMPORTS_PER_SOL)),
        nonce
      );
      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      await logReceipt({
        id: String(nonce),
        targetWallet: targetWallet.trim(),
        projectUrl,
        amountSol: amountNum,
        grade: gradeLabel,
        status: "CONFIRMED",
        txSignature: sig,
        createdAt: new Date().toISOString(),
      });
      onExecuted?.();
    } catch (err) {
      const reason = parseSolVoxError(err);
      await logReceipt({
        id: String(Date.now()),
        targetWallet: targetWallet.trim(),
        projectUrl,
        amountSol: amountNum,
        grade: gradeLabel,
        status: "BLOCKED_ON_CHAIN",
        errorReason: reason,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#111119] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400">Guarded execution</span>
        <Send className="h-4 w-4 text-zinc-500" />
      </div>

      <div className="mb-5 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Transfer Amount (SOL)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.01"
            value={amountSol}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 font-mono text-sm text-white focus:border-[#9945FF] focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleExecute}
          disabled={!publicKey || !targetWallet || executing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14F195] px-4 py-2.5 text-xs font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          {executing ? "Executing On-Chain..." : "Execute Guarded Action"}
        </button>
      </div>

      <div className="space-y-2.5">
        {receipts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
            On-chain confirmations and Anchor rejection proofs (<code className="text-zinc-400">InsufficientTrustGrade</code>,{" "}
            <code className="text-zinc-400">DailyLimitExceeded</code>) will appear here.
          </div>
        ) : (
          receipts.map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-3 text-xs ${
                r.status === "CONFIRMED"
                  ? "border-[#14F195]/30 bg-[#14F195]/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span
                  className={`inline-flex items-center gap-1.5 ${
                    r.status === "CONFIRMED" ? "text-[#14F195]" : "text-red-400"
                  }`}
                >
                  {r.status === "CONFIRMED" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldBan className="h-3.5 w-3.5" />
                  )}
                  {r.status === "CONFIRMED" ? "CONFIRMED ON-CHAIN" : "BLOCKED ON-CHAIN"}
                </span>
                <span className="font-mono text-zinc-200">{r.amountSol} SOL</span>
              </div>

              <p className="mt-1 font-mono text-[11px] text-zinc-400">
                To: {truncateAddress(r.targetWallet)} · Grade {r.grade}
              </p>

              {r.errorReason && <p className="mt-1.5 text-red-200">{r.errorReason}</p>}

              {r.txSignature && (
                <a
                  href={explorerTxUrl(r.txSignature)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-[#14F195] hover:underline"
                >
                  Explorer: {truncateAddress(r.txSignature)} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
