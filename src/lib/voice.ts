"use client";

let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

/**
 * Stops any currently playing SolVox voice clip and releases its object URL.
 */
export function stopVoicePlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (activeUrl) {
    URL.revokeObjectURL(activeUrl);
    activeUrl = null;
  }
}

/**
 * Speaks a status, verdict, or on-chain rejection alert via ElevenLabs TTS (/api/voice/speak).
 * Non-blocking: silently returns if ElevenLabs is unconfigured or playback is blocked.
 */
export async function speakText(text: string): Promise<void> {
  if (!text.trim()) return;
  try {
    stopVoicePlayback();
    const res = await fetch("/api/voice/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.includes("audio")) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    activeUrl = url;

    audio.onended = () => {
      if (activeUrl === url) {
        URL.revokeObjectURL(url);
        activeUrl = null;
        activeAudio = null;
      }
    };

    await audio.play();
  } catch {
    // Non-blocking TTS fallback
  }
}
