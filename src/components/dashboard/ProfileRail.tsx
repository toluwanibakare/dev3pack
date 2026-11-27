"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { gradeToLabel, truncateAddress } from "@/lib/constants";
import { isProgramConfigured } from "@/lib/program";
import type { PolicyVaultData } from "@/lib/types";

const PALETTES = [
  ["#9945FF", "#00D1FF"],
  ["#14F195", "#00D1FF"],
  ["#FF7AC6", "#9945FF"],
  ["#FFB86B", "#FF5C8A"],
  ["#7C9BFF", "#14F195"],
];

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function Identicon({ seed }: { seed: string }) {
  const { cells, palette } = useMemo(() => {
    const h = hashString(seed || "solvox");
    const p = PALETTES[h % PALETTES.length];
    const grid: boolean[] = [];
    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        grid[y * 5 + x] = ((h >> (y * 3 + x)) & 1) === 1;
        grid[y * 5 + (4 - x)] = grid[y * 5 + x];
      }
    }
    return { cells: grid, palette: p };
  }, [seed]);

  return (
    <div
      className="grid h-full w-full grid-cols-5 gap-[2px] p-2.5"
      style={{ background: `linear-gradient(145deg, ${palette[0]}22, ${palette[1]}18)` }}
    >
      {cells.map((on, i) => (
        <span
          key={i}
          className="rounded-[2px]"
          style={{
            background: on ? palette[i % 2] : "transparent",
            opacity: on ? 0.95 : 0,
          }}
        />
      ))}
    </div>
  );
}

function WeekStrip() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const week = useMemo(() => {
    if (!today) return Array.from({ length: 7 }, () => null as Date | null);
    const monday = new Date(today);
    const shift = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - shift);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [today]);

  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-[#111119] p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous week"
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/5 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[12px] font-semibold text-zinc-200">
          {today
            ? today.toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : "This week"}
        </p>
        <button
          type="button"
          aria-label="Next week"
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/5 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {week.map((day, i) => {
          const isToday = !!today && !!day && day.toDateString() === today.toDateString();
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase text-zinc-600">
                {day ? day.toLocaleDateString("en-US", { weekday: "narrow" }) : "·"}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl text-[12px] font-bold transition ${
                  isToday
                    ? "bg-[#3B82F6] text-white shadow-[0_6px_18px_-6px_rgba(59,130,246,0.9)]"
                    : "text-zinc-400"
                }`}
              >
                {day ? day.getDate() : "–"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({
  time,
  title,
  detail,
  highlighted,
}: {
  time: string;
  title: string;
  detail: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-11 shrink-0 pt-3 text-right text-[10px] font-semibold tabular-nums text-zinc-600">
        {time}
      </span>
      <div
        className={`flex-1 rounded-xl border px-3.5 py-2.5 transition ${
          highlighted
            ? "border-[#3B82F6]/40 bg-[#12224A]"
            : "border-white/[0.06] bg-white/[0.02]"
        }`}
      >
        <p className="text-[11px] font-bold text-white">{title}</p>
        <p className={`mt-0.5 text-[10px] ${highlighted ? "text-blue-200/80" : "text-zinc-500"}`}>
          {detail}
        </p>
      </div>
    </div>
  );
}

export function ProfileRail({ vault }: { vault: PolicyVaultData | null }) {
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58() ?? "";
  const programReady = isProgramConfigured();

  const limit = vault ? Number(vault.dailySpendLimitLamports) / 1_000_000_000 : 0;
  const grade = vault ? gradeToLabel(vault.minTrustGrade) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-white/[0.07] bg-[#111119] p-6 text-center">
        <div className="mx-auto h-[92px] w-[92px] rounded-full bg-[conic-gradient(from_140deg,#9945FF,#00D1FF,#14F195,#9945FF)] p-[3px]">
          <div className="h-full w-full rounded-full bg-[#111119] p-1">
            <div className="h-full w-full overflow-hidden rounded-full">
              <Identicon seed={address} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-[15px] font-bold text-white">
          {address ? truncateAddress(address, 4) : "Guest wallet"}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          {vault ? `Grade ${grade} policy` : address ? "No policy vault yet" : "Connect to load your vault"}
        </p>

        <div data-tour="wallet-connect" className="user-card-wallet mt-4">
          <WalletMultiButton />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-600">Daily cap</p>
            <p className="mt-0.5 text-[12px] font-bold text-white">
              {limit > 0 ? `${limit.toFixed(2)} SOL` : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-600">Status</p>
            <p className={`mt-0.5 flex items-center gap-1 text-[12px] font-bold ${vault?.paused ? "text-amber-300" : "text-mint"}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {vault ? (vault.paused ? "Paused" : "Armed") : "Idle"}
            </p>
          </div>
        </div>
      </div>

      <WeekStrip />

      <div className="rounded-[22px] border border-white/[0.07] bg-[#111119] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-zinc-200">Upcoming</h3>
          <span className="text-[10px] font-medium text-zinc-600">Auto</span>
        </div>

        <div className="space-y-2.5">
          <TimelineRow
            time="00:00"
            title="Daily window resets"
            detail={limit > 0 ? `${limit.toFixed(2)} SOL allowance refreshed` : "Set a cap to refresh"}
            highlighted={!!vault}
          />
          <TimelineRow
            time="Next"
            title="Attestation required"
            detail={grade ? `Grade ${grade}+ to pass the vault` : "Grade B+ recommended"}
          />
          <TimelineRow
            time="Now"
            title={vault ? "Guarded execution ready" : "Initialize policy vault"}
            detail={vault ? "Voice or manual action go through" : "Deposit, cap and grade first"}
            highlighted={!vault}
          />
        </div>

        <div className="mt-4 flex items-center gap-1.5 border-t border-white/[0.06] pt-3 text-[10px] font-medium text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: programReady ? "#14F195" : "#F59E0B" }} />
          {programReady ? "Program live on devnet" : "Program ID missing"}
        </div>
      </div>
    </div>
  );
}