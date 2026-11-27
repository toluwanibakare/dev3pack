"use client";

import React, { useEffect, useState } from "react";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

/**
 * Branded SolVox launch screen using the 3D V-waveform animation.
 * Plays once per browser session on initial load, then fades out smoothly.
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
    const t1 = setTimeout(() => setPhase("fading"), 1500);
    const t2 = setTimeout(() => setPhase("gone"), 2000);
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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-all duration-500 ease-out ${
        phase === "fading"
          ? "pointer-events-none scale-[1.03] opacity-0"
          : "scale-100 opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Hero3DCore className="relative h-[280px] w-[320px] sm:h-[340px] sm:w-[380px]" />
    </div>
  );
}
