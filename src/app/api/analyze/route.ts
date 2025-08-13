// app/api/analyze/route.ts
import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  console.log("🚀 [Analyze API] Starting analysis process with GoogleGenAI (@google/genai)");

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("❌ [Analyze API] No GOOGLE_GENERATIVE_AI_API_KEY found in environment variables!");
    return new Response(JSON.stringify({ error: "API key configuration missing" }), { status: 500 });
  }

  try {
    console.log("📥 [Analyze API] Parsing request body");
    const body = await req.json();
    const { publicUrl, prompt } = body as { publicUrl: string; prompt?: string };

    if (!publicUrl) {
      return new Response(JSON.stringify({ error: "publicUrl is required" }), { status: 400 });
    }

    // Check video size
    const head = await fetch(publicUrl, { method: "HEAD" });
    const len = Number(head.headers.get("content-length") ?? "0");
    if (len > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File is > 20MB. Gemini can only process videos under 20MB." }), { status: 400 });
    }

    // Download video
    const fileRes = await fetch(publicUrl);
    if (!fileRes.ok) {
      return new Response(JSON.stringify({ error: "Failed to download video from URL" }), { status: 400 });
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    const base64Video = Buffer.from(new Uint8Array(arrayBuffer)).toString("base64");

    // Initialize GoogleGenAI client
    const ai = new GoogleGenAI({ apiKey });

    // Prepare contents for video analysis
    const analysisPrompt = `Analyze this short video and return STRICT JSON only with this shape:\n{\n  "visualElements": "1-3 sentences describing graphic hooks in the video. Any transtions, effects, text on screen, etc.",\n  "hook": "The exact hook used and why the opening grabs attention (or not), with a timestamp if relevant.",\n  "context": "Key beats in order with MM:SS timestamps.",\n  "cta": "What the call-to-action is and how it's framed. If any.",\n  "engagement_factors": ["factor1", "factor2", "factor3],\n  "sentiment": "positive/negative/neutral",\n  "tone": "descriptive tone"\n}`;
    const analysisContents = [
      {
        inlineData: {
          mimeType: "video/mp4",
          data: base64Video,
        },
      },
      { text: analysisPrompt },
    ];
    {
      /*
 "00:11": "He explains the gift is for showing up live.",
    "00:13": "He reveals it's a 'SECRET PROJECT'",
    "00:14": "He states it's been in the works for multiple years.",
    "00:16": "He mentions it's part of the reason he delayed the launch.",
    "00:17": "He explains this is so 'EVERY SINGLE PERSON CAN GET ONE'",
    "00:20": "He clarifies 'SO IF YOU'RE LIKE WELL WHAT IS IT?'",
    "00:22": "He says, 'I CAN'T TELL YOU WHAT IT IS YET'",
    "00:23": "But adds, 'BUT I CAN TELL YOU THAT IT'S BETTER THAN AN NFT'",
    "00:25": "He continues, 'IT'S LESS THAN A BITCOIN'",
    "00:26": "He emphasizes, 'AND EVERY SINGLE PERSON INCLUDING YOU'",
    "00:28": "Will get one absolutely free just for showing up.",
    "00:31": "He poses the question, 'IF YOU WANT THE FREE EVENT AND THE SECRE
  */
    }
    // Prepare contents for transcript extraction
    const transcriptPrompt = `You are a transcriptionist. You must give the transcript as exact as possible with time timestamps: MM:SS. You will return only the transcript and timestamp. No other analysis or phrases.`;
    const transcriptContents = [
      {
        inlineData: {
          mimeType: "video/mp4",
          data: base64Video,
        },
      },
      { text: transcriptPrompt },
    ];

    console.log("📡 [Analyze API] Sending concurrent requests to Gemini...");
    // const startTime = Date.now();

    // Make concurrent API calls
    const [analysisResponse, transcriptResponse] = await Promise.all([
      ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: analysisContents }),
      ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: transcriptContents }),
    ]);

    console.log("📝 [Analyze API] Analysis response:", analysisResponse);
    console.log("📝 [Analyze API] Transcript response:", transcriptResponse);

    // const endTime = Date.now();
    // console.log(`✅ [Analyze API] Gemini responded in ${(endTime - startTime) / 1000}s`);

    // Extract analysis text
    let analysisText = "";
    try {
      analysisText = (analysisResponse as any)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) {
      console.error("❌ [Analyze API] Could not extract analysis text:", e);
    }

    // Extract transcript text
    let transcriptText = "";
    try {
      transcriptText = (transcriptResponse as any)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (e) {
      console.error("❌ [Analyze API] Could not extract transcript text:", e);
    }

    // Return combined response
    return new Response(
      JSON.stringify({
        analysis: analysisText,
        transcript: transcriptText,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("❌ [Analyze API] Unexpected error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
