import { NextResponse, NextRequest } from "next/server";
import { ApifyClient } from "apify-client";
import { ApifyData } from "../../../types/apify";

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
  isAd: boolean | null;
  createdAt: string | null;
  username: string | null;
  name: string | null;
  bioDescription: string | null;
  followers: number | null;
  likes: number | null;
  videoCount: number | null;
  platformUrl: string | null;
  downloadUrls: string[] | null;
  videoLikes: number | null;
  videoShares: number | null;
  videoPlays: number | null;
  videoSaves: number | null;
  videoComments: number | null;
};

// interface ApifyData {
//   videoMeta?: {
//     duration?: number;
//     subtitleLinks?: Array<{ language: string; downloadLink: string }>;
//   };
//   musicMeta?: {
//     playUrl?: string;
//   };
//   text?: string;
//   hashtags?: string[];
//   isAd?: boolean;
//   createTimeISO?: string;
//   authorMeta?: {
//     name?: string;
//     avatar?: string;
//     profileUrl?: string;
//     nickName?: string;
//     signtaure?: string;
//     biolink?: string;
//     fans?: number;
//     heart?: number;
//     video?: number;
//   };
//   webVideoUrl?: string;
//   mediaUrls?: string[];
//   diggCount?: number;
//   shareCount?: number;
//   playCount?: number;
//   collectCount?: number;
//   commentCount?: number;
// }

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
      videoUrl: data.mediaUrls?.[0] ?? null,
      audioUrl: data.musicMeta?.playUrl ?? null,
      caption: typeof data.text === "string" ? data.text : null,
      hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
      duration: typeof data.videoMeta?.duration === "number" ? data.videoMeta.duration : null,
      transcriptSource: Array.isArray(data.videoMeta?.subtitleLinks)
        ? data.videoMeta.subtitleLinks.find((s: { language: string; downloadLink: string }) => s.language === "eng-US")?.downloadLink ?? null
        : null,
      author: typeof data.authorMeta?.name === "string" ? data.authorMeta.name : null,
      avatar: typeof data.authorMeta?.avatar === "string" ? data.authorMeta.avatar : null,
      webVideoUrl: typeof data.webVideoUrl === "string" ? data.webVideoUrl : null,
      isAd: typeof data.isAd === "boolean" ? data.isAd : null,
      createdAt: typeof data.createTimeISO === "string" ? data.createTimeISO : null,
      username: typeof data.authorMeta?.nickName === "string" ? data.authorMeta.nickName : null,
      name: typeof data.authorMeta?.name === "string" ? data.authorMeta.name : null,
      bioDescription: typeof data.authorMeta?.signtaure === "string" ? data.authorMeta.signtaure : null,
      followers: typeof data.authorMeta?.fans === "number" ? data.authorMeta.fans : null,
      likes: typeof data.authorMeta?.heart === "number" ? data.authorMeta.heart : null,
      videoCount: typeof data.authorMeta?.video === "number" ? data.authorMeta.video : null,
      platformUrl: typeof data.authorMeta?.profileUrl === "string" ? data.authorMeta.profileUrl : null,
      downloadUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls : null,
      videoLikes: typeof data.diggCount === "number" ? data.diggCount : null,
      videoShares: typeof data.shareCount === "number" ? data.shareCount : null,
      videoPlays: typeof data.playCount === "number" ? data.playCount : null,
      videoSaves: typeof data.collectCount === "number" ? data.collectCount : null,
      videoComments: typeof data.commentCount === "number" ? data.commentCount : null,
    };

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
