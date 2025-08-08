import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import fetch from "node-fetch";
import { writeFile } from "fs/promises";
import { join } from "path";

const sb_url = process.env.SUPABASE_URL!;
const sb_secret_key = process.env.SUPABASE_SECRET_KEY!;

if (!sb_url || !sb_secret_key) {
  throw new Error("Supabase URL or secret key is not set in environment variables");
}

const supabase = createClient(sb_url, sb_secret_key);

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawUserId = session?.user?.sub;
    const sanitizedUserId = rawUserId.replace(/[|]/g, "_");
    console.log(rawUserId);
    // return rawUserId;
    // Add more detailed parsing and error handling
    let requestBody;
    try {
      requestBody = await request.json();
      // console.log("Request body********************************:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    // console.log(requestBody);
    const videoData = requestBody;

    if (!videoData) {
      console.error("Missing videoData in request");
      return NextResponse.json({ error: "Video data is required" }, { status: 400 });
    }

    // Check if videoData is valid before proceeding
    if (!videoData || (typeof videoData !== "object" && !Array.isArray(videoData))) {
      console.error("Invalid videoData format:", videoData);
      return NextResponse.json({ error: "Invalid video data format" }, { status: 400 });
    }

    // Handle both array and direct object from hormozi-json.json
    const videoItem = Array.isArray(videoData) ? videoData[0] : videoData;

    if (!videoItem) {
      console.error("No valid video item found in data");
      return NextResponse.json({ error: "No valid video item found in data" }, { status: 400 });
    }

    // Ensure we have a video URL to download
    const videoUrl = videoItem?.videoUrl || videoItem?.downloadUrls?.[0] || null;

    if (!videoUrl) {
      return NextResponse.json({ error: "No video URL found in data" }, { status: 400 });
    }

    const videoId = Date.now().toString();
    const videoFileName = `${sanitizedUserId}/${videoId}/video.mp4`;
    const thumbnailFileName = `${sanitizedUserId}/${videoId}/thumbnail.jpg`;

    try {
      // Download & Upload video
      const videoBuffer = await downloadFile(videoUrl);
      const { error: videoUploadError } = await supabase.storage.from("videos").upload(videoFileName, videoBuffer, {
        contentType: "video/mp4",
        cacheControl: "3600",
      });

      if (videoUploadError) {
        console.error("Video upload error:", videoUploadError);
        return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
      }

      // Get public video URL
      const { data: videoUrlData } = supabase.storage.from("videos").getPublicUrl(videoFileName);

      // Download and upload thumbnail
      const thumbnailUrl = videoItem.thumbnailUrl;
      let storedThumbnailUrl = null;

      if (thumbnailUrl) {
        try {
          const thumbnailBuffer = await downloadFile(thumbnailUrl);
          await supabase.storage.from("videos").upload(thumbnailFileName, thumbnailBuffer, {
            contentType: "image/jpeg",
            cacheControl: "3600",
          });

          const { data: thumbUrlData } = supabase.storage.from("videos").getPublicUrl(thumbnailFileName);
          storedThumbnailUrl = thumbUrlData.publicUrl;
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          // Continue even if thumbnail upload fails
        }
      }

      // Store in DB with complete metadata plus stored URLs
      const { data, error } = await supabase
        .from("videos")
        .insert([
          {
            user_id: sanitizedUserId, // Add user_id from authenticated session
            data: videoItem, // Store entire JSON metadata
            video_url: videoUrlData.publicUrl, // URL to our stored copy
            thumbnail_url: storedThumbnailUrl,
            title: videoItem.text || "Untitled",
            source_platform: "TikTok",
            source_url: videoItem.webVideoUrl || "",
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Database error", error);
        return NextResponse.json({ error: "Failed to save video data", details: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        videoId: data[0].id,
        videoUrl: videoUrlData.publicUrl,
        message: "Video uploaded successfully",
      });
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Failed to download video" }, { status: 500 });
    }
  } catch (e) {
    console.error("Error in POST /api/upload:", e);
    return NextResponse.json({ error: `Internal Server Error ${e}` }, { status: 500 });
  }
}
