import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@ai-sdk/google";

const sb_url = process.env.SUPABASE_URL!;
const sb_secret_key = process.env.SUPABASE_SECRET_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

if (!sb_url || !sb_secret_key) {
  throw new Error("Supabase URL or secret key is not set in environment variables");
}

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const supabase = createClient(sb_url, sb_secret_key);
const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    // Fetch the video data from Supabase
    const { data: videoData, error: videoError } = await supabase.from("videos").select("*").eq("id", videoId).eq("user_id", userId).single();

    if (videoError || !videoData) {
      console.error("Error fetching video:", videoError);
      return NextResponse.json({ error: "Video not found or you don't have permission to access it" }, { status: 404 });
    }

    // Prepare data for Gemini analysis
    const videoContent = videoData.data;
    const videoCaption = videoContent.text || "";
    const hashtags = videoContent.hashtags?.join(" ") || "";

    // Create analysis prompt
    const analysisPrompt = `
      Analyze this TikTok video content:

      Caption: ${videoCaption}

      Hashtags: ${hashtags}

      Creator: ${videoContent.authorMeta?.nickName || "Unknown"}

      Please provide:
      1. A brief summary of what this video is about
      2. The main topics or themes covered
      3. The target audience it's likely trying to reach
      4. Key engagement drivers in this content
      5. Content improvement suggestions
    `;

    // Call Gemini API for analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const analysisText = response.text();

    // Store analysis results in Supabase
    const { error: updateError } = await supabase
      .from("videos")
      .update({
        ai_analysis: analysisText,
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", videoId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error saving analysis:", updateError);
      return NextResponse.json({ error: "Failed to save analysis results" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      videoId: videoId,
      analysis: analysisText,
    });
  } catch (e) {
    console.error("Error in POST /api/analyze-video:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
