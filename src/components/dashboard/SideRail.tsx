"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  HelpCircle,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", match: "/dashboard", label: "Overview", Icon: LayoutGrid },
  { href: "/dashboard/console", match: "/dashboard/console", label: "Guard console", Icon: ShieldCheck },
];

const README_URL = "https://github.com/toluwanibakare/dev3pack/blob/main/README.md";

export function SideRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center justify-between border-r border-white/[0.08] bg-[#08080c] py-6 md:flex">
      <div className="flex flex-col items-center gap-8">
        <Link
          href="/"
          aria-label="SolVox landing page"
          title="Back to landing page"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
        >
          <Image
            src="/brand/solvox-icon-dark.png"
            alt="SolVox"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-xl object-cover transition group-hover:opacity-85"
          />
          <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
            Landing page
          </span>
        </Link>

        <nav className="flex flex-col items-center gap-2">
          {NAV.map(({ href, match, label, Icon }) => {
            const active =
              match === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(match);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                data-tour={match === "/dashboard/console" ? "guard-console-nav" : undefined}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                  active
                    ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                }`}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
                <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
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
          onClick={() => window.dispatchEvent(new CustomEvent("solvox:open-tour"))}
          aria-label="Tour guide"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-[#14F195]"
        >
          <HelpCircle className="h-[19px] w-[19px]" strokeWidth={1.8} />
          <span className="pointer-events-none absolute left-[54px] z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#111119] px-2.5 py-1 text-[11px] font-medium text-zinc-200 opacity-0 shadow-xl transition group-hover:opacity-100">
            Tour guide
          </span>
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-white/10 bg-[#08080c]/95 px-2 py-2 shadow-2xl backdrop-blur-xl md:hidden">
      <Link
        href="/"
        aria-label="SolVox landing page"
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10"
      >
        <Image
          src="/brand/solvox-icon-dark.png"
          alt="SolVox"
          width={36}
          height={36}
          className="h-9 w-9 object-cover"
        />
      </Link>
      {NAV.map(({ href, match, label, Icon }) => {
        const active =
          match === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(match);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              active ? "bg-white/[0.08] text-white" : "text-zinc-500 active:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>
        );
      })}
    </nav>
  );
}
