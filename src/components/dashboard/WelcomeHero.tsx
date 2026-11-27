"use client";

import React from "react";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

interface WelcomeHeroProps {
  name: string;
}

export function WelcomeHero({ name }: WelcomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#E7D3FF_0%,#CB9FFA_34%,#A96CF4_68%,#8B4DF0_100%)] px-6 py-7 text-[#210B3A] sm:px-9 sm:py-9 lg:min-h-[286px]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-40%] left-[38%] h-72 w-72 rounded-full bg-[#7C2AE8]/30 blur-3xl" />

      <div className="relative z-10 flex max-w-[430px] flex-col">
        <p className="text-[13px] font-medium tracking-wide text-[#3A1560]/75">
          Hi, {name}
        </p>
        <h1 className="mt-2 text-[31px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[42px]">
          Guard your SOL
          <br />
          before it moves.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-[#310F57]/70 sm:text-[14px]">
          Voice in, policy checked, chain enforced. Nothing leaves the vault
          unless the program agrees.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href="#execute"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#0C0514] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1B0B2E] active:scale-[0.98]"
          >
            Start now
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#inspect"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#3A1560]/25 bg-white/20 px-4 py-2.5 text-[13px] font-semibold text-[#2A0F45] backdrop-blur-sm transition hover:bg-white/30"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            Check a target
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-16 top-1/2 hidden -translate-y-1/2 sm:block lg:-right-10">
        <div className="origin-center scale-[0.58] lg:scale-[0.66]">
          <Hero3DCore />
        </div>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 hidden rounded-full border border-[#3A1560]/20 bg-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2A0F45]/80 backdrop-blur-sm lg:block">
        Devnet
      </div>

      <div className="pointer-events-none absolute -right-10 bottom-[-70px] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_35%_30%,#F0E1FF_0%,#C79BFA_45%,#8B4DF0_100%)] opacity-80 blur-[2px] sm:hidden" />
    </section>
  );
}