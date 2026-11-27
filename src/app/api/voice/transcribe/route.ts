import { NextResponse } from "next/server";

/**
 * POST /api/voice/transcribe
 * Stub for Olamzy (T-09): ElevenLabs Scribe STT + intent extraction.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — Olamzy to wire ElevenLabs Scribe STT (T-09)." },
    { status: 501 }
  );
}
