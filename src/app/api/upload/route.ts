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

    // --- TEST JSON HANDLING ---
    // let requestBody;
    // try {
    //   requestBody = await request.json();
    // } catch (parseError) {
    //   console.error("Failed to parse request JSON:", parseError);
    //   return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    // }
    // const videoData = requestBody;
    // console.log("video DATA**********", videoData);
    // if (!videoData) {
    //   console.error("Missing videoData in request");
    //   return NextResponse.json({ error: "Video data is required" }, { status: 400 });
    // }
    // if (!videoData || (typeof videoData !== "object" && !Array.isArray(videoData))) {
    //   console.error("Invalid videoData format:", videoData);
    //   return NextResponse.json({ error: "Invalid video data format" }, { status: 400 });
    // }
    // const videoItem = Array.isArray(videoData) ? videoData[0] : videoData;
    // if (!videoItem) {
    //   console.error("No valid video item found in data");
    //   return NextResponse.json({ error: "No valid video item found in data" }, { status: 400 });
    // }

    // --- APIFY API CALL RESPONSE ---
    let videoItem;
    try {
      videoItem = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    if (!videoItem) {
      console.error("No valid video item found in data");
      return NextResponse.json({ error: "No valid video item found in data" }, { status: 400 });
    }
    console.log("VIDEO ITEM", videoItem);
    // Ensure we have a video URL to download
    const videoUrl = videoItem?.videoUrl || videoItem?.downloadUrls || null;

    if (!videoUrl) {
      return NextResponse.json({ error: "No video URL found in data" }, { status: 400 });
    }

    const creatorId = videoItem?.creatorId || "unknown_creator";
    const videoId = videoItem?.videoId || Date.now().toString();

    const videoFileName = `${sanitizedUserId}/${creatorId}/${videoId}/video.mp4`;
    const thumbnailFileName = `${sanitizedUserId}/${creatorId}/${videoId}/thumbnail.jpg`;
    const avatarFileName = `${sanitizedUserId}/${creatorId}/avatar.jpg`; // for avatar

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
      const { data: videoUrlData } = await supabase.storage.from("videos").getPublicUrl(videoFileName);
      console.log("Video URL Data****************:", videoUrlData);
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

          const { data: thumbUrlData } = await supabase.storage.from("videos").getPublicUrl(thumbnailFileName);
          storedThumbnailUrl = thumbUrlData.publicUrl;
        } catch (error) {
          console.error("Error uploading thumbnail:", error);
          // Continue even if thumbnail upload fails
        }
      }

      // Download and upload avatar
      const avatarUrl = videoItem?.avatar;
      let storedAvatarUrl = null;
      if (avatarUrl) {
        try {
          const avatarBuffer = await downloadFile(avatarUrl);
          await supabase.storage.from("videos").upload(avatarFileName, avatarBuffer, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: true,
          });
          const { data: avatarUrlData } = await supabase.storage.from("videos").getPublicUrl(avatarFileName);
          storedAvatarUrl = avatarUrlData.publicUrl;
        } catch (error) {
          console.error("Error uploading avatar:", error);
        }
      }

      // Store in DB with complete metadata plus stored URLs
      const { data, error } = await supabase
        .from("videos")
        .insert([
          {
            user_id: sanitizedUserId, // Add user_id from authenticated session
            videoId: videoItem?.videoId,
            avatarId: videoItem?.creatorId,
            data: videoItem, // Store entire JSON metadata
            video_url: videoUrlData?.publicUrl, // URL to our stored copy
            thumbnail_url: storedThumbnailUrl,
            title: videoItem.caption || videoItem.text || "Untitled",
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
        videoId: data?.[0]?.id ?? videoItem?.videoId,
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
