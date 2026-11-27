"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how" },
  { label: "Trust grades", href: "#trust" },
  { label: "Developers", href: "#developers" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container-wide flex h-[68px] items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/solvox-logo-notag-mono-white.png"
            alt="SolVox"
            width={1257}
            height={440}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-cloud"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-slate md:inline-flex">
            <SearchGlyph />
            <span className="hidden xl:inline">Search</span>
            <kbd className="rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-slate">
              ⌘K
            </kbd>
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full brand-gradient px-4 py-2 text-[13px] font-semibold text-void transition hover:brightness-105"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cloud lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-black/95 lg:hidden">
          <nav className="container-wide flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] font-medium text-cloud/85 transition hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full brand-gradient px-4 py-3 text-sm font-semibold text-void"
            >
              Launch app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function SearchGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}