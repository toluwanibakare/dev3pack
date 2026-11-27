import { NextResponse } from "next/server";

/**
 * POST /api/voice/speak
 * Converts text into spoken audio using ElevenLabs TTS (eleven_turbo_v2_5).
 * Streams audio/mpeg back to the client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const text = body?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'text' field" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // George voice (works on both free & paid tiers)

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ELEVENLABS_API_KEY is not configured.",
          isMock: true,
        },
        { status: 200 }
      );
    }

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => "");
      console.warn(`[ElevenLabs TTS] Upstream error ${ttsRes.status}: ${errText}`);
      return NextResponse.json(
        { error: `ElevenLabs TTS error: ${errText || ttsRes.statusText}` },
        { status: ttsRes.status }
      );
    }

    // Stream the binary audio directly
    const audioBuffer = await ttsRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "TTS synthesis failed";
    console.error("[/api/voice/speak] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
