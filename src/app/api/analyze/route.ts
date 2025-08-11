// app/api/analyze/route.ts
import { NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

function inferMediaTypeFromPath(p: string) {
  const ext = p.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/mov";
    case "webm":
      return "video/webm";
    case "avi":
      return "video/avi";
    default:
      return "video/mp4";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { publicUrl, prompt } = (await req.json()) as {
      publicUrl: string;
      prompt?: string;
    };
    if (!publicUrl) {
      return new Response(JSON.stringify({ error: "publicUrl is required" }), { status: 400 });
    }

    // Enforce < 20 MB
    const head = await fetch(publicUrl, { method: "HEAD" });
    const len = Number(head.headers.get("content-length") ?? "0");
    if (len > 20 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File is > 20MB. Use Files API for large videos." }), { status: 400 });
    }

    // Download bytes server-side
    const res = await fetch(publicUrl);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to download video from URL" }), { status: 400 });
    }
    const arrayBuffer = await res.arrayBuffer();

    const mediaType = head.headers.get("content-type") || inferMediaTypeFromPath(publicUrl) || "video/mp4";

    // Stream with AI SDK v5
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            { type: "file", data: new Uint8Array(arrayBuffer), mediaType, filename: "input-video" },
            {
              type: "text",
              text:
                prompt ??
                `Analyze this short video and return STRICT JSON only with this shape:
{
  "visualElements": "1-3 sentences describing notable visuals and on-screen text.",
  "hook": "Why the opening grabs attention (or not), with a timestamp if relevant.",
  "context": "Key beats in order with MM:SS timestamps.",
  "cta": "What the call-to-action is and how it’s framed."
}
Do not include markdown fences or extra commentary.`,
            },
          ],
        },
      ],
    });

    // ✅ v5: no deprecated helpers
    return result.toUIMessageStreamResponse();
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err?.message ?? "Unknown error" }), { status: 500 });
  }
}
