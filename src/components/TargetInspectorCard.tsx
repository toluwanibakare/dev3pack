"use client";

import React, { useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ExternalLink, Mic, Search, ShieldAlert, ShieldCheck, Volume2 } from "lucide-react";
import { explorerTxUrl, gradeToLabel, truncateAddress } from "@/lib/constants";
import { fetchTrustEntry } from "@/lib/program";
import { AnalysisResult, TrustEntryData } from "@/lib/types";

interface TargetInspectorCardProps {
  targetWallet: string;
  projectUrl: string;
  onTargetChange: (wallet: string, url: string) => void;
  onAnalysisComplete: (result: AnalysisResult | null) => void;
  onAmountDetected?: (amountSol: string) => void;
}

export function TargetInspectorCard({
  targetWallet,
  projectUrl,
  onTargetChange,
  onAnalysisComplete,
  onAmountDetected,
}: TargetInspectorCardProps) {
  const { connection } = useConnection();
  const [analyzing, setAnalyzing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [onChainTrust, setOnChainTrust] = useState<TrustEntryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function refreshOnChainTrust(walletAddr: string) {
    try {
      const pk = new PublicKey(walletAddr);
      const entry = await fetchTrustEntry(connection, pk);
      setOnChainTrust(entry);
    } catch {
      setOnChainTrust(null);
    }
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!targetWallet || !projectUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: targetWallet.trim(), projectUrl: projectUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analysis failed.");
        await refreshOnChainTrust(targetWallet.trim());
        return;
      }
      setAnalysis(data);
      onAnalysisComplete(data);
      await refreshOnChainTrust(targetWallet.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setAnalyzing(false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "command.webm");
        try {
          const res = await fetch("/api/voice/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Voice transcription unavailable.");
            return;
          }
          if (data.transcript) setTranscript(data.transcript);
          if (data.parsedIntent?.amountSol) {
            onAmountDetected?.(String(data.parsedIntent.amountSol));
          }
        } catch {
          setError("Voice endpoint unreachable.");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone permission denied or unavailable.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function speakVerdict() {
    if (!analysis) return;
    try {
      const text = `Target graded ${analysis.grade} with score ${analysis.score} out of 100. ${
        analysis.redFlags[0] || "No critical red flags detected."
      }`;
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("audio")) return;
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
    } catch {
      // Non-blocking TTS fallback
    }
  }

  return (
    <section className="flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#111119] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-400">Voice &amp; inspector</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              recording
                ? "border-red-500 bg-red-500/20 text-red-300"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-[#00D1FF]/50 hover:text-white"
            }`}
          >
            <Mic className={`h-3 w-3 ${recording ? "animate-pulse text-red-400" : "text-[#00D1FF]"}`} />
            {recording ? "Release" : "Hold to speak"}
          </button>
          <Search className="h-4 w-4 text-zinc-500" />
        </div>
      </div>

      {transcript && (
        <div className="mb-3 rounded-xl border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-3 py-2 text-xs text-cyan-200">
          “{transcript}”
        </div>
      )}

      <form onSubmit={handleAnalyze} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Recipient Wallet (Devnet)
          </label>
          <input
            type="text"
            placeholder="Base58 Solana address..."
            value={targetWallet}
            onChange={(e) => onTargetChange(e.target.value, projectUrl)}
            className="w-full rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 font-mono text-xs text-white focus:border-[#00D1FF] focus:outline-none"
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
            onChange={(e) => onTargetChange(targetWallet, e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 text-xs text-white focus:border-[#00D1FF] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={analyzing || !targetWallet || !projectUrl}
          className="w-full rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {analyzing ? "Investigating Web + On-Chain..." : "Verify & Attest Grade On-Chain"}
        </button>
      </form>

      {error && (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          {error}
        </div>
      )}

      {onChainTrust && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#0A0A1A] px-3 py-2 text-xs">
          <span className="text-zinc-400">On-Chain TrustEntry PDA</span>
          <span className="font-mono font-bold text-[#14F195]">
            Grade {gradeToLabel(onChainTrust.grade)} ({onChainTrust.grade}/5)
          </span>
        </div>
      )}

      {analysis && (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-[#0A0A1A] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Attested Grade</span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  analysis.gradeNumeric >= 4
                    ? "bg-[#14F195]/15 text-[#14F195]"
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
              <button
                type="button"
                onClick={speakVerdict}
                title="Narrate verdict"
                className="rounded-full border border-white/10 p-1 text-zinc-400 hover:text-white"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-zinc-400">Wash-Loop Ratio</span>
              <p className="font-mono font-semibold text-white">
                {Math.round(analysis.washLoopMetrics.reciprocalRatio * 100)}%
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-2">
              <span className="text-zinc-400">Wallet Age / Txs</span>
              <p className="font-mono font-semibold text-white">
                {analysis.washLoopMetrics.walletAgeDays}d · {analysis.washLoopMetrics.txCount} txs
              </p>
            </div>
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
                  className="flex items-center gap-1 text-xs text-[#00D1FF] hover:underline"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{c.title || c.url}</span>
                </a>
              ))}
            </div>
          )}

          {analysis.attestTxSignature && (
            <a
              href={explorerTxUrl(analysis.attestTxSignature)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-zinc-400 hover:text-white"
            >
              <span>Attest Tx</span>
              <span className="font-mono">{truncateAddress(analysis.attestTxSignature)}</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
