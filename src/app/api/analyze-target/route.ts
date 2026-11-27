import { NextResponse } from "next/server";

/**
 * POST /api/analyze-target
 * Stub for Olamzy (T-05 & T-06):
 * 1. Scrape/search projectUrl via Firecrawl
 * 2. Analyze wallet wash-loop history via Helius / Solana RPC
 * 3. Attest grade on-chain via solvox::set_trust_grade
 * 4. Persist report to Supabase verification_reports
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.wallet || !body?.projectUrl) {
    return NextResponse.json(
      { error: "Both wallet and projectUrl are required." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "Not implemented yet — Olamzy to wire Firecrawl, RPC scorer, and TrustEntry attestor (T-05/T-06).",
    },
    { status: 501 }
  );
}
