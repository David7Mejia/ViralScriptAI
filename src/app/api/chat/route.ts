import type { NextRequest } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { createClient } from "@supabase/supabase-js";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

const sb_url = process.env.SUPABASE_URL!;
const sb_secret_key = process.env.SUPABASE_SECRET_KEY!;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

if (!sb_url || !sb_secret_key) {
  throw new Error("Supabase URL or secret key is not set in environment variables");
}

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const supabase = createClient(sb_url, sb_secret_key);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.sub;

    // Parse the request body
    const { messages, videoId } = await request.json();

    // Validate required fields
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Video ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the video data from Supabase
    const { data: videoData, error: videoError } = await supabase.from("videos").select("*").eq("id", videoId).eq("user_id", userId).single();

    if (videoError || !videoData) {
      return new Response(JSON.stringify({ error: "Video not found or you don't have permission to access it" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Extract video content for context
    const videoContent = videoData.data;
    const videoContext = {
      caption: videoContent.text || "",
      hashtags: videoContent.hashtags?.join(" ") || "",
      creator: videoContent.authorMeta?.nickName || "Unknown",
      stats: {
        likes: videoContent.diggCount || 0,
        shares: videoContent.shareCount || 0,
        comments: videoContent.commentCount || 0,
        plays: videoContent.playCount || 0,
      },
    };

    // Add system message with video context
    const systemMessage = {
      role: "system",
      content: `You are an AI assistant specialized in analyzing TikTok content for creators.

You have access to the following video data:
- Caption: ${videoContext.caption}
- Hashtags: ${videoContext.hashtags}
- Creator: ${videoContext.creator}
- Stats: ${JSON.stringify(videoContext.stats)}

Provide insights, analysis, and suggestions to help the creator improve their content.
Focus on engagement, audience targeting, content structure, and trend alignment.`,
    };

    // Combine system message with user messages
    const combinedMessages = [systemMessage, ...messages];

    // Generate a streaming response using AI SDK
    const { textStream } = streamText({
      model: google("gemini-2.5-flash-lite"),
      messages: combinedMessages,
    });

    // Create a ReadableStream from the textStream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const text of textStream) {
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    // Return a streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (e) {
    console.error("Error in POST /api/chat:", e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
