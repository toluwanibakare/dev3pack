import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Check,
  Code2,
  Database,
  Fingerprint,
  Globe2,
  Lock,
  MessageCircle,
  Mic,
  ShieldCheck,
  X,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { Aurora } from "@/components/motion/Aurora";
import { Hero3DCore } from "@/components/motion/Hero3DCore";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { ScrollToTop } from "@/components/motion/ScrollToTop";
import { TerminalFeed } from "@/components/motion/TerminalFeed";

const MARQUEE = ["Devnet", "Anchor", "Firecrawl", "ElevenLabs", "Supabase", "Solana"];

const STATS: {
  label: string;
  value: number | string;
  decimals?: number;
  tick?: number;
  mono?: boolean;
}[] = [
  { label: "Program ID", value: "GQqU...RNjc", mono: true },
  { label: "On-chain PDAs", value: 3 },
  { label: "Instructions", value: 6 },
  { label: "Trust grades", value: "A–F" },
  { label: "Asset", value: "Native SOL" },
  { label: "Cluster", value: "Devnet" },
];

const STEPS = [
  {
    icon: Mic,
    title: "Speak",
    copy: "Say what you want in plain language. ElevenLabs turns the request into a verified command, then the parsed intent is shown back before anything moves.",
  },
  {
    icon: Globe2,
    title: "Verify",
    copy: "Firecrawl reads the live project site for red flags. The scorer reads wallet history for wash loops and self-funding, then writes an A to F grade on-chain.",
  },
  {
    icon: ShieldCheck,
    title: "Execute",
    copy: "An Anchor PolicyVault checks the attested grade and your daily cap. Inside the rule it settles and writes a receipt. Outside it, the transaction reverts on Solana.",
  },
];

const GRADES = [
  { grade: "A", label: "Trusted", tone: "text-mint border-mint/30 bg-mint/10" },
  { grade: "B", label: "Healthy", tone: "text-cyan border-cyan/30 bg-cyan/10" },
  { grade: "C", label: "Watch", tone: "text-slate border-slate/30 bg-slate/10" },
  { grade: "D", label: "Risky", tone: "text-amber border-amber/30 bg-amber/10" },
  { grade: "F", label: "Blocked", tone: "text-danger border-danger/30 bg-danger/10" },
];

const COMMUNITY = [
  {
    icon: Lock,
    title: "Anchor-enforced policy",
    copy: "Daily caps and a minimum grade live in the PolicyVault. The program enforces them, not the prompt.",
  },
  {
    icon: Globe2,
    title: "Firecrawl citations",
    copy: "Every check cites the live pages it read, so a grade is traceable to a source, not a vibe.",
  },
  {
    icon: AudioLines,
    title: "ElevenLabs voice",
    copy: "Voice is the input and the narration. The loop needs it, so it is core, not a bolt-on.",
  },
  {
    icon: Fingerprint,
    title: "Attested grades",
    copy: "Grades are written to a TrustEntry account and read by the vault. The model can never pass a grade by hand.",
  },
  {
    icon: Database,
    title: "Supabase audit log",
    copy: "Every check and outcome is stored with its on-chain signature, so you can review what passed and why.",
  },
  {
    icon: Code2,
    title: "Open source",
    copy: "One Anchor program, three PDAs, native SOL on devnet. Clean for developers and judges to inspect.",
  },
];

const FOOTER = [
  {
    heading: "Product",
    links: [
      { label: "Voice console", href: "/dashboard" },
      { label: "Policy vaults", href: "/dashboard" },
      { label: "Trust grades", href: "#trust" },
      { label: "Receipts", href: "/dashboard" },
    ],
  },
  {
    heading: "How it works",
    links: [
      { label: "Speak", href: "#how" },
      { label: "Verify", href: "#how" },
      { label: "Execute", href: "#how" },
      { label: "The guardrail", href: "#trust" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "GitHub", href: "https://github.com/toluwanibakare/dev3pack" },
      { label: "Anchor program", href: "https://github.com/toluwanibakare/dev3pack/tree/main/programs/solvox" },
      {
        label: "README",
        href: "https://github.com/toluwanibakare/dev3pack/blob/main/README.md",
      },
      { label: "Launch app", href: "/dashboard" },
    ],
  },
  {
    heading: "Stack",
    links: [
      { label: "Firecrawl", href: "https://docs.firecrawl.dev" },
      { label: "ElevenLabs", href: "https://elevenlabs.io/docs" },
      { label: "Solana", href: "https://solana.com" },
      { label: "Supabase", href: "https://supabase.com/docs" },
    ],
  },
];

function HeroVisual() {
  return <Hero3DCore />;
}

function DottedArrowGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
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
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#00D1FF] transition-transform duration-300 group-hover:translate-x-0.5">
      <path d="M2.5 1.8L13.8 7.6L8.2 9.4L6.1 14.2L2.5 1.8Z" />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-slate">
      {children}
    </p>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <SiteNav />
      <ScrollProgress />

      {/* Top Protocol Ticker Ribbon */}
      <div className="mt-[68px] border-b border-black/20 bg-[#14F195] text-black">
        <Marquee
          items={[
            "ANCHOR POLICYVAULT LIVE ON DEVNET",
            "ZERO LLM TRUST SPOOFING",
            "FIRECRAWL WEB INTELLIGENCE",
            "ELEVENLABS VOICE LOOP",
            "TRUSTREGISTRY PDA ENFORCED",
            "DEV3PACK × SOLANA",
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-4 px-5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
            >
              <span>{item}</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-black/70" />
            </span>
          ))}
        />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-black">
        <Aurora className="opacity-80" />
        <div className="pointer-events-none absolute inset-0 grid-overlay" />

        {/* Subtle CAD crosshair markers */}
        <span aria-hidden className="pointer-events-none absolute left-6 top-8 hidden font-mono text-xs text-white/20 lg:block">+</span>
        <span aria-hidden className="pointer-events-none absolute right-6 top-8 hidden font-mono text-xs text-white/20 lg:block">+</span>
        <span aria-hidden className="pointer-events-none absolute bottom-8 left-1/2 hidden font-mono text-xs text-[#14F195]/40 lg:block">+</span>

        <div className="container-wide relative grid items-center gap-10 pb-10 pt-6 sm:pb-12 sm:pt-8 lg:grid-cols-2 lg:gap-8 lg:pb-14 lg:pt-10">
          <div>
            <Reveal delay={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate">
                <span className="h-1.5 w-1.5 rounded-full brand-gradient" />
                Solana Devnet · Voice Policy Firewall
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-4 font-display text-[44px] leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-[78px]">
                <span className="font-light text-white/90">SPEAK.</span>
                <br />
                <span className="relative my-1.5 inline-block border border-[#14F195]/85 bg-[#14F195]/10 px-3 py-1 font-extrabold text-[#14F195] shadow-[0_0_32px_rgba(20,241,149,0.16)]">
                  <span className="absolute -left-1 -top-1 h-2 w-2 bg-[#14F195]" />
                  <span className="absolute -right-1 -top-1 h-2 w-2 bg-[#14F195]" />
                  <span className="absolute -bottom-1 -left-1 h-2 w-2 bg-[#14F195]" />
                  <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#14F195]" />
                  VERIFY.
                </span>{" "}
                <span className="font-extrabold text-white">EXECUTE.</span>
              </h1>
            </Reveal>

            <Reveal delay={170}>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate sm:text-[16px]">
              A safety lock for sending crypto on Solana. An agent checks the
              live project site and the wallet&apos;s on-chain history, then an
              Anchor program enforces your spend and trust rules before a single
              lamport moves.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-3 rounded-full bg-[#14F195] py-2 pl-2 pr-6 text-[14px] font-bold text-black shadow-[0_0_30px_rgba(20,241,149,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#14F195] transition-transform duration-300 group-hover:scale-105">
                  <DottedArrowGlyph />
                </span>
                Start Speaking
              </Link>
              <a
                href="https://github.com/toluwanibakare/dev3pack/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-cloud transition duration-300 hover:-translate-y-0.5 hover:border-[#00D1FF]/50 hover:text-white"
              >
                <PointerGlyph />
                Read Docs
              </a>
            </div>

            {/* Corner-bracket trust metadata strip */}
            <div className="relative mt-6 inline-flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-white/10 px-4 py-2.5 font-mono text-[11px] text-slate">
              <span aria-hidden className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#14F195]" />
              <span aria-hidden className="absolute right-0 top-0 h-2 w-2 border-r border-t border-[#14F195]" />
              <span aria-hidden className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[#14F195]" />
              <span aria-hidden className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#14F195]" />
              <span className="inline-flex items-center gap-1.5 text-cloud/90">
                <ShieldCheck className="h-3.5 w-3.5 text-mint" />
                Anchor-enforced
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-cyan" />
                Open source
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple" />
                Real devnet txs
              </span>
            </div>
            </Reveal>
          </div>

          <Reveal direction="scale" delay={140}>
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-white/5 bg-black">
        <div className="container-wide py-5">
          <Marquee
            items={MARQUEE.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-6 font-display text-lg font-bold tracking-tight text-white/35"
              >
                <span className="h-1.5 w-1.5 rounded-full brand-gradient" />
                {label}
              </span>
            ))}
          />
        </div>
      </section>

      {/* Stats */}
      <section id="product" className="relative border-t border-white/10 bg-black">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-50" />
        <div className="container-wide relative py-20 sm:py-28">
          <Reveal>
            <div className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#14F195]">
                    ■ 01 <span className="text-slate/60">// 05</span>
                  </span>
                  <Eyebrow>Product signal</Eyebrow>
                </div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  The guardrail, <span className="font-light text-white/80">in numbers.</span>
                </h2>
              </div>
              <p className="max-w-xs font-mono text-[11px] leading-relaxed text-slate">
                Deployed Anchor program specifications on Solana Devnet. Live
                receipts and vault state sync in the console.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="relative grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3 lg:grid-cols-6">
              <span aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 h-2.5 w-2.5 border-l border-t border-[#14F195]" />
              <span aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 h-2.5 w-2.5 border-r border-t border-[#14F195]" />
              <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-10 h-2.5 w-2.5 border-b border-l border-[#14F195]" />
              <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-10 h-2.5 w-2.5 border-b border-r border-[#14F195]" />
              {STATS.map((stat, idx) => (
                <div
                  key={stat.label}
                  className="group bg-black p-5 transition duration-300 hover:bg-[#0b0f14]"
                >
                  <p className="flex items-center justify-between font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-slate">
                    <span>{stat.label}</span>
                    <span className="text-slate/40 group-hover:text-[#14F195]">0{idx + 1}</span>
                  </p>
                  <p className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-white">
                    {typeof stat.value === "string" ? (
                      <span className="font-mono text-lg text-[#14F195]">{stat.value}</span>
                    ) : (
                      <CountUp
                        value={stat.value}
                        decimals={stat.decimals}
                        tick={stat.tick}
                      />
                    )}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Terminal */}
      <section className="relative border-t border-white/10 bg-black">
        <div className="container-wide py-20 sm:py-28">
          <Reveal direction="left">
            <div className="mb-10 max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#14F195]">
                  ■ 02 <span className="text-slate/60">// 05</span>
                </span>
                <Eyebrow>What is happening</Eyebrow>
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                A live feed of <span className="font-light text-white/80">guarded actions.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal direction="scale" delay={100}>
            <div className="relative">
              <span aria-hidden className="pointer-events-none -left-1 -top-1 absolute z-10 h-3 w-3 border-l border-t border-[#00D1FF]" />
              <span aria-hidden className="pointer-events-none -right-1 -top-1 absolute z-10 h-3 w-3 border-r border-t border-[#00D1FF]" />
              <span aria-hidden className="pointer-events-none -bottom-1 -left-1 absolute z-10 h-3 w-3 border-b border-l border-[#00D1FF]" />
              <span aria-hidden className="pointer-events-none -bottom-1 -right-1 absolute z-10 h-3 w-3 border-b border-r border-[#00D1FF]" />
              <TerminalFeed />
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative border-t border-white/10 bg-black">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
        <div className="container-wide relative grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal direction="left">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#14F195]">
                  ■ 03 <span className="text-slate/60">// 05</span>
                </span>
                <Eyebrow>How it works</Eyebrow>
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="font-light text-white/85">Three moves.</span>
                <br />
                <span className="relative mt-2 inline-block border border-[#00D1FF]/80 bg-[#00D1FF]/10 px-2.5 py-0.5 text-[#00D1FF]">
                  <span className="absolute -left-1 -top-1 h-1.5 w-1.5 bg-[#00D1FF]" />
                  <span className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-[#00D1FF]" />
                  <span className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-[#00D1FF]" />
                  <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-[#00D1FF]" />
                  One guardrail.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate">
                The agent proposes. The program decides. That order is the whole
                product, and it is why a blocked payment is a feature working.
              </p>
              <div className="relative mt-8 border border-white/10 bg-panel/60 p-4 transition duration-300 hover:border-[#14F195]/40">
                <span aria-hidden className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#14F195]" />
                <span aria-hidden className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-[#14F195]" />
                <p className="font-mono text-[11px] leading-relaxed text-slate">
                  <span className="text-mint">$</span> solvox verify --target 8xJk...pQ2f
                  <br />
                  <span className="text-slate/70">grade: F (18/100)</span>
                  <br />
                  <span className="text-danger">execute: reverted InsufficientTrustGrade</span>
                  <span className="blink ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-mint" />
                </p>
              </div>
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-purple/60 via-cyan/40 to-mint/50" />
            <div className="space-y-4">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} direction="right" delay={index * 110}>
                  <div className="group relative rounded-2xl border border-white/10 bg-panel/45 p-5 pl-16 transition duration-300 hover:-translate-y-0.5 hover:border-[#14F195]/40 hover:bg-panel/70">
                    <span className="absolute left-3 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black text-[#14F195] transition duration-300 group-hover:border-[#14F195]/50 group-hover:shadow-[0_0_16px_rgba(20,241,149,0.25)]">
                      <step.icon className="h-4 w-4" />
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-[17px] font-bold tracking-tight text-white">
                        {step.title}
                      </h3>
                      <span className="font-mono text-[11px] text-[#14F195]/80">
                        [ 0{index + 1} ]
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate">
                      {step.copy}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust grades */}
      <section id="trust" className="relative border-t border-white/10 bg-black">
        <div className="container-wide grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <Reveal direction="left">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#14F195]">
                  ■ 04 <span className="text-slate/60">// 05</span>
                </span>
                <Eyebrow>Trust grades</Eyebrow>
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="font-light text-white/85">The model proposes.</span>
                <br />
                <span className="relative mt-2 inline-block border border-[#14F195]/85 bg-[#14F195]/10 px-2.5 py-0.5 text-[#14F195]">
                  <span className="absolute -left-1 -top-1 h-1.5 w-1.5 bg-[#14F195]" />
                  <span className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-[#14F195]" />
                  <span className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-[#14F195]" />
                  <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-[#14F195]" />
                  The program decides.
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate">
                A grade is written to an on-chain account by the attestor. The vault
                reads it from the account, so nothing the model says can talk the
                program past your rules.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  "The grade is never passed as an instruction argument.",
                  "Daily spend caps are checked before any transfer.",
                  "Every allowed action writes an immutable receipt.",
                  "A blocked payment is a feature working, not an apology.",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-[13px] leading-snug text-cloud/85"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal direction="scale" delay={120}>
            <div className="rounded-3xl border border-white/10 bg-panel/60 p-6 transition duration-300 hover:border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate">
                  Trust grade
                </span>
                <span className="font-mono text-[11px] text-slate">A to F</span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {GRADES.map((g) => (
                  <div
                    key={g.grade}
                    className={`rounded-xl border px-2 py-3 text-center transition duration-300 hover:-translate-y-1 hover:scale-[1.03] ${g.tone}`}
                  >
                    <p className="font-display text-xl font-extrabold leading-none">{g.grade}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.06em] opacity-80">{g.label}</p>
                  </div>
                ))}
              </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-mint/20 bg-mint/5 px-3 py-2.5">
                <span className="text-[12px] text-cloud/85">Grade B + within cap</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-mint">
                  <Check className="h-3.5 w-3.5" />
                  Settles
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5">
                <span className="text-[12px] text-cloud/85">Grade F or over cap</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger">
                  <X className="h-3.5 w-3.5" />
                  Reverts
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-3">
              <p className="font-mono text-[11px] text-slate">Program</p>
              <p className="mt-1 font-mono text-[12px] text-cloud">
                GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc
              </p>
            </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Developers / community */}
      <section id="developers" className="relative border-t border-white/10 bg-black">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
        <div className="container-wide relative py-20 sm:py-28">
          <Reveal direction="left">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#14F195]">
                  ■ 05 <span className="text-slate/60">// 05</span>
                </span>
                <Eyebrow>Built for developers</Eyebrow>
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Every sponsor tool <span className="font-light text-white/80">does real work.</span>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate">
                No bolt-ons. Each piece is required by the core loop, so the demo
                is the product.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITY.map((card, index) => (
              <Reveal key={card.title} delay={index * 70}>
                <div className="group glow-hover relative h-full rounded-2xl border border-white/10 bg-panel/50 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#14F195]/40">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black text-cyan transition duration-300 group-hover:border-[#14F195]/40 group-hover:text-[#14F195] group-hover:shadow-[0_0_16px_rgba(20,241,149,0.22)]">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-[11px] text-slate/50 group-hover:text-[#14F195]">
                      [ 0{index + 1} ]
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[16px] font-bold tracking-tight text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate">
                    {card.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-black">
        <div className="container-wide py-20 sm:py-24">
          <Reveal direction="scale">
            <div className="relative rounded-[28px] brand-gradient p-px shadow-[0_0_50px_rgba(20,241,149,0.14)]">
            <div className="relative overflow-hidden rounded-[27px] bg-black px-6 py-16 text-center sm:px-12 sm:py-20">
              <Aurora className="opacity-70" />
              <span aria-hidden className="pointer-events-none absolute left-6 top-6 font-mono text-xs text-white/25">+</span>
              <span aria-hidden className="pointer-events-none absolute right-6 top-6 font-mono text-xs text-white/25">+</span>
              <span aria-hidden className="pointer-events-none absolute bottom-6 left-6 font-mono text-xs text-white/25">+</span>
              <span aria-hidden className="pointer-events-none absolute bottom-6 right-6 font-mono text-xs text-white/25">+</span>
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#14F195]">
                  Ready on Devnet
                </span>
                <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  <span className="font-light text-white/85">Stop sending</span> blind.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate">
                  Set your rules once, then let the program hold the line. Try it
                  on Solana devnet.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#14F195] py-2 pl-2 pr-6 text-[14px] font-bold text-black shadow-[0_0_30px_rgba(20,241,149,0.28)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#14F195] transition-transform duration-300 group-hover:scale-105">
                      <DottedArrowGlyph />
                    </span>
                    Launch the App
                  </Link>
                  <a
                    href="https://github.com/toluwanibakare/dev3pack"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-mono text-[12px] font-semibold uppercase tracking-wider text-cloud transition duration-300 hover:-translate-y-0.5 hover:border-[#00D1FF]/50 hover:text-white"
                  >
                    <PointerGlyph />
                    View Source
                  </a>
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black">
        <div className="container-wide py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Image
                src="/brand/solvox-logo-notag-mono-white.png"
                alt="SolVox"
                width={1257}
                height={440}
                className="h-7 w-auto opacity-90"
              />
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate">
                Speak. Verify. Execute. An on-chain trust and policy firewall for
                Solana. Devnet only, not financial advice.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="https://github.com/toluwanibakare/dev3pack"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate transition hover:text-cloud"
                >
                  <Code2 className="h-4 w-4" />
                </a>
                <a
                  href="#developers"
                  aria-label="Community"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate transition hover:text-cloud"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {FOOTER.map((column) => (
              <div key={column.heading}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-cloud/70 transition hover:text-cloud"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-[12px] text-slate sm:flex-row sm:items-center">
            <p>© 2026 SolVox. Built for Dev3pack x Solana.</p>
            <p className="font-mono text-[11px] text-slate/70">
              GQqU...RNjc · Devnet
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}