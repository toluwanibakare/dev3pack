import { NextResponse } from "next/server";

/**
 * POST /api/voice/speak
 * Stub for Olamzy (T-09): ElevenLabs eleven_v4_turbo TTS audio stream.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented yet — Olamzy to wire ElevenLabs TTS (T-09)." },
    { status: 501 }
  );
}
