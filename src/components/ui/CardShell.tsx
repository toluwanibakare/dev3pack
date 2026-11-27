import React from "react";

export function CardShell({
  step,
  title,
  caption,
  aside,
  children,
}: {
  step: number;
  title: string;
  caption: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-deep/70 p-6 backdrop-blur-sm transition-colors duration-200 hover:border-white/15 sm:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px brand-gradient opacity-50" />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-void/70 font-display text-sm font-extrabold text-cloud">
            {step}
          </span>
          <div>
            <h2 className="font-display text-[15px] font-bold tracking-tight text-cloud">
              {title}
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-slate">{caption}</p>
          </div>
        </div>
        {aside}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}