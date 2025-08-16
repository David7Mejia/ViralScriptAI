// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { experimental_transcribe as transcribe, streamObject } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";

const ANALYZE_MODEL = process.env.ANALYZE_MODEL || "gpt-4o-mini";
const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL || "whisper-1";

// strict JSON shape we want from the LLM
const analysisSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  structure: z.object({
    hook: z.string().default(""),
    problem: z.string().default(""),
    story: z.string().default(""),
    payoff: z.string().default(""),
    cta: z.string().default(""),
  }),
  topics: z.array(z.string()).max(12).default([]),
  keywords: z.array(z.string()).max(24).default([]),
  summary: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const { publicUrl, tiktokData } = await req.json();
  console.log("incoming data>>>>>>>>>>>>>>>>>>>>>>", publicUrl, tiktokData);
  // const duration: number | null = typeof tiktokData?.duration === "number" ? tiktokData.duration : null;

  const audioUrl: string | null = typeof publicUrl === "string" ? publicUrl : null;
  if (!audioUrl) {
    return NextResponse.json({ error: "No audio/video URL provided" }, { status: 400 });
  }

  // fetch audio/video bytes (OpenAI accepts mp4 for STT)
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    return NextResponse.json({ error: `Failed to fetch audio: ${audioRes.status}` }, { status: 400 });
  }
  const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
  console.log("Audio bytes length:", audioBytes.length);
  // transcribe -> get STRING

  let transcript = "";
  try {
    const result = await transcribe({
      model: openai.transcription(TRANSCRIBE_MODEL),
      audio: audioBytes,
    });
    transcript = result.text;
    console.log("This is the text from the transcript: ", transcript);
  } catch (error) {
    console.error("Error during transcription:", error);
  }
  // const { text: transcript } = await transcribe({
  //   model: openai.transcription(TRANSCRIBE_MODEL),
  //   audio: audioBytes,
  // });
  // stream structured analysis JSON
  const prompt =
    `Analyze this short social video TRANSCRIPT.\n` +
    `Return STRICT JSON with keys: sentiment, structure {hook,problem,story,payoff,cta}, topics[3-7], keywords[5-12], summary.\n\n` +
    `TRANSCRIPT:\n"""${(transcript || "").slice(0, 8000)}"""`;
  //@ts-ignore
  const { partialObjectStream } = streamObject({
    model: openai(ANALYZE_MODEL),
    schema: analysisSchema,
    prompt: prompt,
  });

  // for await (const partialObject of partialObjectStream) {
  //   console.clear();
  //   console.log(partialObject);
  // }

  // Consume and log the partialObjectStream
  const partials: unknown[] = [];
  try {
    console.log("🔄 [/api/analyze] Streaming partialObjectStream...");
    for await (const partialObject of partialObjectStream) {
      console.log(partialObject);
      partials.push(partialObject);
    }
    console.log("✅ [/api/analyze] Stream complete. Partials count:", partials.length);
  } catch (err) {
    console.error("❌ [/api/analyze] Error reading partialObjectStream:", err);
    return NextResponse.json({ error: "Stream read failed", details: String(err) }, { status: 500 });
  }

  // Return JSON response with transcript and partials
  return NextResponse.json({ transcript, partials }, { status: 200 });
}
