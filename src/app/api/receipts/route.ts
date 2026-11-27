import { NextResponse } from "next/server";

/**
 * GET & POST /api/receipts
 * Stub for Olamzy (T-10): Supabase action_receipts audit log.
 */
export async function GET() {
  return NextResponse.json({ receipts: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — Olamzy to wire Supabase receipts (T-10)." },
    { status: 501 }
  );
}
