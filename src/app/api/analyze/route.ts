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
  console.log(`🔑 [Analyze API] API Key present: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);

  try {
    console.log("📥 [Analyze API] Parsing request body");
    const body = await req.json();
    console.log("📝 [Analyze API] Request body keys:", Object.keys(body));

    const { publicUrl, prompt } = body as { publicUrl: string; prompt?: string };
    console.log("🔗 [Analyze API] Video URL:", publicUrl ? `${publicUrl.substring(0, 60)}...` : "undefined");

    if (!publicUrl) {
      return new Response(JSON.stringify({ error: "publicUrl is required" }), { status: 400 });
    }

    // Size check (20MB)
    console.log("📏 [Analyze API] HEAD request for size check");
    const head = await fetch(publicUrl, { method: "HEAD" });
    const len = Number(head.headers.get("content-length") ?? "0");
    const sizeMB = (len / (1024 * 1024)).toFixed(2);
    console.log(`📊 [Analyze API] Content-Length: ${sizeMB}MB`);
    if (len > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File is > 20MB. Gemini can only process videos under 20MB." }), { status: 400 });
    }

    // Download
    console.log("📥 [Analyze API] Downloading video bytes...");
    const fileRes = await fetch(publicUrl);
    if (!fileRes.ok) {
      console.log(`❌ [Analyze API] Failed to download video: ${fileRes.status} ${fileRes.statusText}`);
      return new Response(JSON.stringify({ error: "Failed to download video from URL" }), { status: 400 });
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    console.log(`✅ [Analyze API] Downloaded ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`);

    // Encode base64
    console.log("🔄 [Analyze API] Converting to Base64");
    const base64Video = Buffer.from(new Uint8Array(arrayBuffer)).toString("base64");
    console.log(`✅ [Analyze API] Base64 length: ${(base64Video.length / (1024 * 1024)).toFixed(2)}MB`);

    const promptText =
      prompt ??
      `Analyze this short video and return STRICT JSON only with this shape:\n{\n  "visualElements": "1-3 sentences describing notable visuals and on-screen text.",\n  "hook": "Why the opening grabs attention (or not), with a timestamp if relevant.",\n  "context": "Key beats in order with MM:SS timestamps.",\n  "cta": "What the call-to-action is and how it's framed.",\n  "engagement_factors": ["factor1", "factor2"],\n  "sentiment": "positive/negative/neutral",\n  "tone": "descriptive tone"\n}\nDo not include markdown fences or extra commentary.`;
    console.log("📝 [Analyze API] Prompt preview:", promptText.substring(0, 120));

    // Init client (exactly like gemini.js pattern)
    console.log("🔧 [Analyze API] Initializing GoogleGenAI client");
    const ai = new GoogleGenAI({ apiKey });

    // Build contents (camelCase keys for @google/genai)
    const contents = [
      {
        inlineData: {
          mimeType: "video/mp4",
          data: base64Video,
        },
      },
      { text: promptText },
    ];

    console.log("📡 [Analyze API] Sending request to Gemini (models.generateContent)...");
    const startTime = Date.now();
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents });
    const endTime = Date.now();
    console.log(`✅ [Analyze API] Gemini responded in ${(endTime - startTime) / 1000}s`);

    // Extract text like in gemini.js
    let text = "";
    try {
      text = (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("🧾 [Analyze API] Extracted text length:", text.length);
      console.log("🔎 [Analyze API] Text preview:", text.substring(0, 120));
    } catch (e) {
      console.error("❌ [Analyze API] Could not extract text from response:", e);
    }

    if (!text) {
      console.log("⚠️ [Analyze API] Empty text response, returning raw object");
      return new Response(JSON.stringify(response, null, 2), { headers: { "Content-Type": "application/json" } });
    }

    // Return text (likely JSON string from the model)
    console.log("📤 [Analyze API] Returning model text to client");
    return new Response(text, { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("❌ [Analyze API] Unexpected error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
