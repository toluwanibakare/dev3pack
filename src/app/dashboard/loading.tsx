import React from "react";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A1A] text-zinc-100">
      <Hero3DCore className="relative h-[260px] w-[300px] sm:h-[300px] sm:w-[340px]" />
      <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14F195]">
        Loading Command Center...
      </p>
    </div>
  );
}
