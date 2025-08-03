
import { NextResponse, NextRequest } from "next/server";
import { ApifyClient } from "apify-client";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});


type TikTokApiResponse = {
  videoUrl: string | null;
  audioUrl: string | null;
  caption: string | null;
  hashtags: string[];
  duration: number | null;
  transcriptSource: string | null;
  author: string | null;
  avatar: string | null;
  webVideoUrl: string | null;
};

interface ApifyData {
  videoMeta?: {
    downloadAddr?: string;
    duration?: number;
    subtitleLinks?: Array<{ language: string; downloadLink: string }>;
  };
  musicMeta?: {
    playUrl?: string;
  };
  text?: string;
  hashtags?: string[];
  authorMeta?: {
    name?: string;
    avatar?: string;
  };
  webVideoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url }: { url: string } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Set the JSON body for single video expected by the Apify Actor
    const actorInput = {
      excludePinnedPosts: false,
      postURLs: [url],
      profileScrapeSections: ["videos"],
      profileSorting: "latest",
      resultsPerPage: 1,
      shouldDownloadCovers: true,
      shouldDownloadSlideshowImages: false,
      shouldDownloadSubtitles: true,
      shouldDownloadVideos: true,
    };

    console.log("Received URL:", url);

    // Call the actor and await response
    const run = await client.actor("OtzYfK1ndEGdwWFKQ").call(actorInput);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "No video data found" }, { status: 404 });
    }


    const data = items[0] as ApifyData;
    const response: TikTokApiResponse = {
      videoUrl: data.videoMeta?.downloadAddr ?? null,
      audioUrl: data.musicMeta?.playUrl ?? null,
      caption: typeof data.text === "string" ? data.text : null,
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
      duration: typeof data.videoMeta?.duration === "number" ? data.videoMeta.duration : null,
      transcriptSource:
        Array.isArray(data.videoMeta?.subtitleLinks)
          ? data.videoMeta.subtitleLinks.find((s) => s.language === "eng-US")?.downloadLink ?? null
          : null,
      author: typeof data.authorMeta?.name === "string" ? data.authorMeta.name : null,
      avatar: typeof data.authorMeta?.avatar === "string" ? data.authorMeta.avatar : null,
      webVideoUrl: typeof data.webVideoUrl === "string" ? data.webVideoUrl : null,
    };

    return NextResponse.json({response}, );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
