export interface ApifyData {
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
  };
  webVideoUrl?: string;
  mediaUrls?: string[];
  diggCount?: number;
  shareCount?: number;
  playCount?: number;
  collectCount?: number;
  commentCount?: number;
}
