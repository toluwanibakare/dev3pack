"use client";

import React, { useEffect, useState } from "react";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

/**
 * Branded SolVox launch screen using the 3D V-waveform animation.
 * Plays once per browser session on initial load, then fades out cleanly.
 */
export function AppLoader() {
  const [phase, setPhase] = useState<"show" | "fading" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("solvox_loaded");
    if (reduced || seen) {
      setPhase("gone");
      return;
    }

    sessionStorage.setItem("solvox_loaded", "1");
    const t1 = setTimeout(() => setPhase("fading"), 1350);
    const t2 = setTimeout(() => setPhase("gone"), 1750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading SolVox"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05050a] transition-opacity duration-400 ${
        phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <div className="relative flex flex-col items-center">
        <Hero3DCore className="relative h-[260px] w-[300px] sm:h-[300px] sm:w-[340px]" />
        <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14F195]">
          SolVox · Initializing Firewall
        </p>
        <div className="mt-3 h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[sv-loadbar_1.35s_ease-out_forwards] brand-gradient" />
        </div>
      </div>
    </div>
  );
}
