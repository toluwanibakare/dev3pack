"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

/**
 * Branded SolVox launch screen using the 3D V-waveform animation.
 * Plays on initial session load and when launching into /dashboard from the landing page.
 */
export function AppLoader() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [phase, setPhase] = useState<"show" | "fading" | "gone">("show");

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const playSplash = useCallback(
    (holdMs = 1500, totalMs = 2000) => {
      clearTimers();
      setPhase("show");
      timersRef.current = [
        setTimeout(() => setPhase("fading"), holdMs),
        setTimeout(() => setPhase("gone"), totalMs),
      ];
    },
    [clearTimers]
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prevPath = prevPathRef.current;
    prevPathRef.current = pathname;

    if (reduced) {
      setPhase("gone");
      return;
    }

    // Initial load: play once per browser session
    if (prevPath === null) {
      const seen = sessionStorage.getItem("solvox_loaded");
      if (seen) {
        setPhase("gone");
        return;
      }
      sessionStorage.setItem("solvox_loaded", "1");
      playSplash(1500, 2000);
      return clearTimers;
    }

    // Launching from landing page (/) into /dashboard
    if (prevPath === "/" && pathname.startsWith("/dashboard")) {
      playSplash(1000, 1450);
      return clearTimers;
    }
  }, [pathname, playSplash, clearTimers]);

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
