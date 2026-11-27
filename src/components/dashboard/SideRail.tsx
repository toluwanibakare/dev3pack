"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  LayoutGrid,
  ScanSearch,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { href: "#overview", label: "Overview", Icon: LayoutGrid },
  { href: "#vault", label: "Policy vault", Icon: ShieldCheck },
  { href: "#inspect", label: "Inspect target", Icon: ScanSearch },
  { href: "#execute", label: "Execute", Icon: Send },
];

const README_URL = "https://github.com/toluwanibakare/dev3pack/blob/main/README.md";

export function SideRail() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center justify-between border-r border-white/[0.06] bg-[#0B0B16] py-6 md:flex">
      <div className="flex flex-col items-center gap-8">
        <Link href="/" className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10">
          <Image
            src="/brand/solvox-icon-dark.png"
            alt="SolVox"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-cover transition group-hover:opacity-85"
          />
        </Link>

        <nav className="flex flex-col items-center gap-2">
          {NAV.map(({ href, label, Icon }, i) => (
            <a
              key={href}
              href={href}
              aria-label={label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                i === 0
                  ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
              <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
                {label}
              </span>
            </a>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-2">
        <a
          href={README_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="README"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200"
        >
          <BookOpen className="h-[19px] w-[19px]" strokeWidth={1.8} />
          <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
            README
          </span>
        </a>
        <button
          type="button"
          aria-label="Settings"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-600 transition hover:bg-white/[0.05] hover:text-zinc-300"
        >
          <Settings className="h-[19px] w-[19px]" strokeWidth={1.8} />
          <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-white/10 bg-[#0B0B16]/95 px-2 py-2 shadow-2xl backdrop-blur-xl md:hidden">
      {NAV.map(({ href, label, Icon }, i) => (
        <a
          key={href}
          href={href}
          aria-label={label}
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            i === 0 ? "bg-white/[0.08] text-white" : "text-zinc-500 active:text-white"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </a>
      ))}
    </nav>
  );
}