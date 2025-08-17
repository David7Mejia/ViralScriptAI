# ViralScript AI - Get insights on any TikTok video

The problem with many content creators is that they don't know where to start or understand the patterns used in short form videos to create engaging content. This is where ViralScript AI comes in.

## Design

The thought process behind the app is to allow users to analyze videos and get insights into metrics, the script and video structure like the hook, context, and cta being used.

### Step 1. Getting our JSON data

First we need a way to actaully get information from the video. This can be easily done leveraging the Apify API. Specifically using an Apify actor designed for TikTok videos. This gives us a JSON response with various different metrics and stats scraped in real time. This data also includes temporary video URLs for both Video and Audio, which we will use in order to get the transcript. The actor ID and input can be shown below.

```ts
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

const run = await client.actor("OtzYfK1ndEGdwWFKQ").call(actorInput);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
```

### Step 2. Cleaning and Analyzing the Data

Once we have the JSON data, we need to clean it and extract the relevant information. This involves parsing the JSON response and organizing the data into a more usable format. Leveraging the power of TypeScript we can create an interface and type object from the data we received and create an object with the relevant information we want from the response.

```ts
export interface ApifyData {
  id?: string;
  videoMeta?: {
    duration?: number;
    subtitleLinks?: Array<{ language: string; downloadLink: string }>;
    coverUrl?: string;
  };
  musicMeta?: {
    playUrl?: string;
  };
  text?: string;
  hashtags?: string[];
  isAd?: boolean;
  createTimeISO?: string;
  authorMeta?: {
    name?: string;
    avatar?: string;
    profileUrl?: string;
    nickName?: string;
    signtaure?: string;
    biolink?: string;
    fans?: number;
    heart?: number;
    video?: number;
    id?: string;
    following?: number;
  };
  webVideoUrl?: string;
  mediaUrls?: string;
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  collectCount?: number;
  commentCount?: number;
}

export type TikTokApiResponse = {
  videoId: string | null;
  creatorId: string | null;
  following: number | null;
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
  downloadUrls: string | null;
  videoLikes: number | null;
  videoShares: number | null;
  videoPlays: number | null;
  videoSaves: number | null;
  videoComments: number | null;
  thumbnailUrl: string | null;
};
```

### Step 3. Transcription

We have our data cleaned and ready to be analyzed. The Apify actor does include the subtitle data as a vtt file, but there are 2 problems that can arise here. The first being that the video may not have any subtitle data. The second is the accuracy of the subtitle data. Instead of relying on this data, the OpenAI Whisper transcription model offers a very quick and easy way to transcribe the video or audio file from Apify. We create a Uint8Array buffer from the mp4 URL and pass that for transcription by integrating Vercel's experimental transcribe API call. Important to note that the Whisper model does not stream, so we have to wait until the transcription is finished in order for render and passing to analysis.

```ts
import { experimental_transcribe as transcribe } from "ai";

const audioBytes = new Uint8Array(await audioRes.arrayBuffer());
const { text } = await transcribe({
  model: openai.transcription(TRANSCRIBE_MODEL),
  audio: audioBytes,
});
```

### Step 4. Analysis of Transcript & Insights

Once we receive the transcription we call on the `/analyze` endpoint so now we can have gpt-4o or any other LLM model analyze this transcription for insights. Since we want a structured output response, we define the z object schema and consume it in the backend for normalization and enforcement as well as in the frontend client side to decode and type the streamed object. Utilizing the streamObject from the AI SDK we can ensure a structured streamed object.
```ts
export const AnalysisSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  structure: z.object({
    hook: z.string().default(""),
    problem: z.string().default(""),
    story: z.string().default(""),
    payoff: z.string().default(""),
    cta: z.string().default(""),
  }),
  topics: z.array(z.string()).max(12).default([]),
  keywords: z.array(z.string()).max(24).default([]),
  summary: z.string().default(""),
});


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
```

## Tech Stack

### Lite version for Blotato challenge

ViralScript uses a modern tech stack based in Next.js with TypeScript for both frontend and backend. The app is analyzes content scraped using the Apify TikTok actor and then the response is cleaned and sent for analysis. The AI powered analysis uses Vercel's AI SDK as the framework for calling and streaming OpenAI's Whisper 1 & gpt-4o API's.

### Fullstack branch in progress

In addition testing for the Gemini Pro Flash Lite for visual understanding of the video, as well as Auth0 for authentication and Supabase for a relational PSQL based database.

## UI for v1 of ViralScript

The Lite version page structure features:

### Searchbar

TikTok video URL input - URL is sent to APify and awaits response on the scraped data for cleaning.

### Creator Stats

Stats like Following, Followers, Total Likes, Total Videos, link to TikTok profile shown. Cleaned data for Stats

### Video Metrics

Embeds the URL video with Apify's temporary URL, shows engagement metrics from the video: Likes, Shares, Comments, Views and Saves. Gets basic information from the video like the duration, the description or caption and the date that it was posted.

### Transcript

Shows the transcript of the video, cleaned and formatted for easy reading as well as an estimate reading time and word count.

### AI Content Analysis

AI content analysis is broken down into 4 section. The first section does an analysis on the transcript in order to get the overall structure of the video.

- Hook
- Problem
- Story/Solution
- Payoff/Value
- Call-to-Action
- Content Summary
- Topics
- Keywords

The second section is an overall summary of the strucutre and transcript.
The last 2 sections show the #topics and keywords that are relevant to the video.

# Steps to run the app
- > git clone this repo
- > npm install
- > Create a .env.local file
- > In the .env.local file paste in your API keys/Token
APIFY_TOKEN=
OPENAI_API_KEY=
- > run `npm run dev` in the main directory
  
- > Video used
https://www.tiktok.com/@ahormozi/video/7538931351525838135
