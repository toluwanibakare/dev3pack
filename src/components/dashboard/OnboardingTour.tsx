"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  Lock,
  ScanSearch,
  Send,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wallet,
  X,
} from "lucide-react";

const TOUR_STORAGE_KEY = "solvox_tour_done_v1";

interface TourStep {
  id: string;
  route: "/dashboard" | "/dashboard/console";
  selector: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "wallet",
    route: "/dashboard",
    selector: '[data-tour="wallet-connect"]',
    title: "Connect your Devnet wallet",
    body: "Start here. Connect Phantom or Solflare on Solana Devnet so SolVox can load or initialize your on-chain PolicyVault PDA.",
    Icon: Wallet,
    accent: "text-[#14F195] bg-[#14F195]/15 border-[#14F195]/30",
  },
  {
    id: "overview",
    route: "/dashboard",
    selector: '[data-tour="overview-stats"]',
    title: "Live Devnet telemetry",
    body: "Track your daily spend cap, remaining allowance, on-chain trust policy threshold, and real-time confirmed vs blocked action receipts.",
    Icon: ShieldCheck,
    accent: "text-[#00D1FF] bg-[#00D1FF]/15 border-[#00D1FF]/30",
  },
  {
    id: "nav-console",
    route: "/dashboard",
    selector: '[data-tour="guard-console-nav"]',
    title: "Open the Guard Console",
    body: "This switches to the interactive Guard Console where you configure your vault, inspect targets with voice + Firecrawl, and execute on-chain.",
    Icon: Lock,
    accent: "text-[#9945FF] bg-[#9945FF]/15 border-[#9945FF]/30",
  },
  {
    id: "vault",
    route: "/dashboard/console",
    selector: '[data-tour="policy-vault"]',
    title: "1. Arm your PolicyVault",
    body: "Set your daily SOL cap and minimum trust grade (A, B, or C), then initialize and deposit Devnet SOL. Anchor enforces these rules on-chain.",
    Icon: Lock,
    accent: "text-[#14F195] bg-[#14F195]/15 border-[#14F195]/30",
  },
  {
    id: "inspector",
    route: "/dashboard/console",
    selector: '[data-tour="target-inspector"]',
    title: "2. Speak or inspect a target",
    body: "Hold to speak or enter a recipient wallet + project URL. Firecrawl audits the live website and our RPC scorer attests an A–F grade to TrustEntry.",
    Icon: ScanSearch,
    accent: "text-[#00D1FF] bg-[#00D1FF]/15 border-[#00D1FF]/30",
  },
  {
    id: "execute",
    route: "/dashboard/console",
    selector: '[data-tour="guarded-execution"]',
    title: "3. Execute with on-chain guardrails",
    body: "Click Execute Guarded Action. Grade F or over-limit transfers revert on-chain; passing transfers settle and log an ActionReceipt.",
    Icon: Send,
    accent: "text-[#9945FF] bg-[#9945FF]/15 border-[#9945FF]/30",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = TOUR_STEPS[index];

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const speakStep = useCallback(
    async (stepIdx: number) => {
      stopAudio();
      setVoiceHint(null);
      const step = TOUR_STEPS[stepIdx];
      if (!step) return;
      setSpeaking(true);
      try {
        const res = await fetch("/api/voice/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `${step.title}. ${step.body}` }),
        });
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("audio")) {
          setVoiceHint("Voice guide requires ELEVENLABS_API_KEY in .env.");
          setSpeaking(false);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setSpeaking(false);
        };
        await audio.play();
      } catch {
        setVoiceHint("Voice guide unavailable offline.");
        setSpeaking(false);
      }
    },
    [stopAudio]
  );

  // Auto-open on first visit
  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 650);
      return () => clearTimeout(t);
    }
  }, []);

  // Listen for manual "Tour guide" trigger from SideRail
  useEffect(() => {
    const onOpen = () => {
      setIndex(0);
      setOpen(true);
      if (pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    };
    window.addEventListener("solvox:open-tour", onOpen);
    return () => window.removeEventListener("solvox:open-tour", onOpen);
  }, [pathname, router]);

  // Navigate to the step's route if needed
  useEffect(() => {
    if (!open) return;
    if (pathname !== current.route) {
      router.push(current.route);
    }
  }, [open, current.route, pathname, router]);

  // Speak step when voiceOn
  useEffect(() => {
    if (open && voiceOn) {
      speakStep(index);
    }
    return () => stopAudio();
  }, [open, index, voiceOn, speakStep, stopAudio]);

  // Measure and spotlight the target element
  const measureTarget = useCallback(() => {
    if (!open) return;
    const el = document.querySelector(current.selector) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 8;
    setTargetRect({
      top: Math.max(8, r.top - pad),
      left: Math.max(8, r.left - pad),
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [open, current.selector]);

  useLayoutEffect(() => {
    if (!open) return;
    // Scroll target into view smoothly when step changes
    const timer = setTimeout(() => {
      const el = document.querySelector(current.selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
      measureTarget();
    }, 180);

    const onUpdate = () => measureTarget();
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [open, index, pathname, current.selector, measureTarget]);

  function closeTour() {
    stopAudio();
    localStorage.setItem(TOUR_STORAGE_KEY, "1");
    setOpen(false);
  }

  function goToStep(nextIdx: number) {
    const targetStep = TOUR_STEPS[nextIdx];
    if (!targetStep) return;
    setIndex(nextIdx);
    if (pathname !== targetStep.route) {
      router.push(targetStep.route);
    }
  }

  if (!open) return null;

  // Compute smart floating popover position that NEVER overlaps targetRect
  const popoverStyle: React.CSSProperties = (() => {
    if (!targetRect || typeof window === "undefined") {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = Math.min(370, vw - 32);
    const cardH = 245;
    const gap = 16;

    const overlaps = (top: number, left: number) => {
      const right = left + cardW;
      const bottom = top + cardH;
      return !(
        right <= targetRect.left - 8 ||
        left >= targetRect.left + targetRect.width + 8 ||
        bottom <= targetRect.top - 8 ||
        top >= targetRect.top + targetRect.height + 8
      );
    };

    const clampLeft = (l: number) => Math.max(16, Math.min(vw - cardW - 16, l));
    const clampTop = (t: number) => Math.max(16, Math.min(vh - cardH - 16, t));

    const candidates: { top: number; left: number }[] = [
      // Right of target
      { top: clampTop(targetRect.top), left: targetRect.left + targetRect.width + gap },
      // Left of target
      { top: clampTop(targetRect.top), left: targetRect.left - cardW - gap },
      // Below target
      { top: targetRect.top + targetRect.height + gap, left: clampLeft(targetRect.left) },
      // Above target
      { top: targetRect.top - cardH - gap, left: clampLeft(targetRect.left) },
      // Top-right corner
      { top: 20, left: vw - cardW - 20 },
      // Top-left corner
      { top: 20, left: 96 },
      // Bottom-right corner
      { top: vh - cardH - 20, left: vw - cardW - 20 },
    ];

    for (const c of candidates) {
      const inBounds =
        c.left >= 12 &&
        c.left + cardW <= vw - 12 &&
        c.top >= 12 &&
        c.top + cardH <= vh - 12;
      if (inBounds && !overlaps(c.top, c.left)) {
        return { top: c.top, left: c.left, width: cardW };
      }
    }

    // Last resort: top-right corner
    return { top: 20, right: 20, width: cardW };
  })();

  const isLast = index === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SolVox Interactive Tour"
      className="fixed inset-0 z-[90]"
    >
      {/* Click-blocker backdrop (dimming comes from spotlight box-shadow when targetRect exists) */}
      <div
        onClick={closeTour}
        className={`absolute inset-0 transition-colors duration-300 ${
          targetRect ? "bg-transparent" : "bg-black/75 backdrop-blur-sm"
        }`}
      />

      {/* Spotlight cutout + glowing border */}
      {targetRect && (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-[20px] border-2 border-[#14F195] transition-all duration-300 ease-out"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow:
              "0 0 0 9999px rgba(4, 4, 10, 0.78), 0 0 28px rgba(20, 241, 149, 0.35)",
          }}
        />
      )}

      {/* Floating Tour Card */}
      <div
        style={popoverStyle}
        className="fixed z-[95] rounded-[22px] border border-white/15 bg-[#111119]/95 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#14F195]">
            <ShieldCheck className="h-3 w-3" />
            TOUR · 0{index + 1} / 0{TOUR_STEPS.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (voiceOn) {
                  setVoiceOn(false);
                  stopAudio();
                } else {
                  setVoiceOn(true);
                }
              }}
              aria-pressed={voiceOn}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                voiceOn
                  ? "border-[#00D1FF]/50 bg-[#00D1FF]/15 text-[#00D1FF]"
                  : "border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
              }`}
            >
              {voiceOn ? (
                <Volume2 className={`h-3 w-3 ${speaking ? "animate-pulse" : ""}`} />
              ) : (
                <VolumeX className="h-3 w-3" />
              )}
              {voiceOn ? (speaking ? "Speaking" : "Voice on") : "Voice"}
            </button>
            <button
              type="button"
              onClick={closeTour}
              aria-label="Close tour"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${current.accent}`}
          >
            <current.Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-[16px] font-bold tracking-tight text-white">
              {current.title}
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-400">
              {current.body}
            </p>
          </div>
        </div>

        {voiceHint && (
          <p className="mt-2.5 text-[11px] text-zinc-500">{voiceHint}</p>
        )}

        <div className="mt-4 flex items-center gap-1.5">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => goToStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-[#14F195]"
                  : "w-1.5 bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
          <button
            type="button"
            onClick={closeTour}
            className="text-[11px] font-medium text-zinc-500 transition hover:text-zinc-300"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => goToStep(index - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={closeTour}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#14F195] px-4 py-1.5 text-[11px] font-bold text-black transition hover:brightness-110"
              >
                Start Using SolVox
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(index + 1)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-black transition hover:bg-zinc-200"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
