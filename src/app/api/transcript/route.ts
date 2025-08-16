import { NextRequest, NextResponse } from "next/server";
import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL || "whisper-1";

export async function POST(req: NextRequest) {
  const { publicUrl } = await req.json();

  if (typeof publicUrl !== "string" || !publicUrl) {
    return NextResponse.json({ error: "No audio/video URL provided" }, { status: 400 });
  }

  try {
    const audioRes = await fetch(publicUrl);
    if (!audioRes.ok) {
      return NextResponse.json({ error: `Failed to fetch audio: ${audioRes.status}` }, { status: 400 });
    }

    const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
    const { text } = await transcribe({
      model: openai.transcription(TRANSCRIBE_MODEL),
      audio: audioBytes,
    });

    return NextResponse.json({ transcript: text ?? "" }, { status: 200 });
  } catch (err) {
    console.error("❌ [/api/transcript] Error:", err);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
