import React from "react";

/**
 * Aurora renders slow-drifting blurred brand gradients. Pure CSS; the drift
 * stops under prefers-reduced-motion.
 */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="aurora-layer aurora-a -right-16 -top-10 h-[460px] w-[460px] bg-purple/40" />
      <div className="aurora-layer aurora-b right-24 top-40 h-[380px] w-[380px] bg-mint/25" />
      <div className="aurora-layer aurora-a -left-24 bottom-0 h-[340px] w-[340px] bg-cyan/20" />
    </div>
  );
}