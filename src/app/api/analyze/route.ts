// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { AnalysisSchema } from "@/types/analysis";

const ANALYZE_MODEL = process.env.ANALYZE_MODEL || "gpt-4o-mini";

export async function POST(req: NextRequest) {
  const { publicUrl, tiktokData, transcript } = await req.json();
  console.log("incoming data>>>>>>>>>>>>>>>>>>>>>>", publicUrl, tiktokData);

  if (typeof transcript !== "string" || transcript.trim().length === 0) {
    console.error("❌ [/api/analyze] Missing transcript in request body.");
    return NextResponse.json({ error: "Transcript is required for analysis" }, { status: 400 });
  }

  console.log("Using provided transcript (length):", transcript.length);

  const prompt =
    `Analyze this short social video TRANSCRIPT.\n` +
    `Return STRICT JSON with keys: sentiment, structure {hook,problem,story,payoff,cta}, topics[3-7], keywords[5-12], summary.\n\n` +
    `TRANSCRIPT:\n"""${transcript.slice(0, 8000)}"""`;

  const result = streamObject({
    model: openai(ANALYZE_MODEL),
    schema: AnalysisSchema,
    prompt,
    onError: ({ error }) => {
      console.error("❌ [streamObject] error:", error);
    },
    onFinish: ({ error, usage }) => {
      if (error) {
        console.warn("⚠️ [streamObject] finish with schema error:", error);
      } else {
        console.log("✅ [streamObject] finished. usage:", usage);
      }
    },
  });

  return result.toTextStreamResponse();
}
