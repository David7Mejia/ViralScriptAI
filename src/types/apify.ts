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
  mediaUrls?: string[];
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
  downloadUrls: string[] | null;
  videoLikes: number | null;
  videoShares: number | null;
  videoPlays: number | null;
  videoSaves: number | null;
  videoComments: number | null;
  thumbnailUrl: string | null;
};
