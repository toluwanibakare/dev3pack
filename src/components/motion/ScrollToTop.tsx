"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0b0b12]/90 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-cloud shadow-[0_0_24px_rgba(20,241,149,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#14F195]/60 hover:text-[#14F195] ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-3.5 w-3.5" />
      Top
    </button>
  );
}
