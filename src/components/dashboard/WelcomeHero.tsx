"use client";

import React from "react";
import Link from "next/link";
import { Hero3DCore } from "@/components/motion/Hero3DCore";

interface WelcomeHeroProps {
  name: string;
}

function DottedArrowGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <circle cx="3" cy="3" r="1.2" />
      <circle cx="6.5" cy="5.5" r="1.2" />
      <circle cx="10" cy="8" r="1.35" />
      <circle cx="6.5" cy="10.5" r="1.2" />
      <circle cx="3" cy="13" r="1.2" />
      <circle cx="3" cy="8" r="1.2" />
    </svg>
  );
}

function PointerGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#3A1560]">
      <path d="M2.5 1.8L13.8 7.6L8.2 9.4L6.1 14.2L2.5 1.8Z" />
    </svg>
  );
}

export function WelcomeHero({ name }: WelcomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#E7D3FF_0%,#CB9FFA_34%,#A96CF4_68%,#8B4DF0_100%)] px-6 py-7 text-[#210B3A] sm:px-9 sm:py-9 lg:min-h-[286px]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-40%] left-[38%] h-72 w-72 rounded-full bg-[#7C2AE8]/30 blur-3xl" />

      <div className="relative z-10 flex max-w-[440px] flex-col">
        <p className="text-[13px] font-medium tracking-wide text-[#3A1560]/75">
          Hi, {name}
        </p>
        <h1 className="mt-2 font-display text-[31px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[42px]">
          Guard your SOL
          <br />
          before it moves.
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-[#310F57]/75 sm:text-[14px]">
          Voice in, policy checked, chain enforced. Nothing leaves the vault
          unless the program agrees.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/console#execute"
            className="group inline-flex items-center gap-2.5 rounded-full bg-[#0C0514] py-1.5 pl-1.5 pr-5 text-[13px] font-semibold text-white transition hover:bg-[#1B0B2E] active:scale-[0.98]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14F195] text-black">
              <DottedArrowGlyph />
            </span>
            Start now
          </Link>
          <Link
            href="/dashboard/console#inspect"
            className="inline-flex items-center gap-2 rounded-full border border-[#3A1560]/25 bg-white/25 px-4 py-2.5 text-[13px] font-semibold text-[#2A0F45] backdrop-blur-sm transition hover:bg-white/35"
          >
            <PointerGlyph />
            Check a target
          </Link>
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
