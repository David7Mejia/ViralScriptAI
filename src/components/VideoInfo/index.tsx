import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Heart, Share, Play, MessageCircle, Bookmark, Users, Clock, CheckCircle, MapPin, Music } from "lucide-react";
import type { ApifyData } from "../../types/apify";
import type { JSX } from "react";
import { useState } from "react";
import CreatorStats from "../CreatorStats";

interface VideoInfoProps {
  videoData?: ApifyData | ApifyData[] | null | undefined;
}

function VideoInfo({ videoData }: VideoInfoProps): JSX.Element {
  // If array, use first item; else use object; fallback to empty object
  const data: any = Array.isArray(videoData) ? videoData[0] : videoData || {};
  const [transcript, setTranscript] = useState<string>("");

  const formatNumber = (num?: number): string => {
    if (!num && num !== 0) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateEngagementRate = (): string => {
    const totalEngagements = (data.diggCount || 0) + (data.commentCount || 0) + (data.shareCount || 0);
    const rate = data.playCount ? (totalEngagements / data.playCount) * 100 : 0;
    return rate.toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      {/* Author Information */}
      <CreatorStats authorMeta={data.authorMeta} formatNumber={formatNumber} />

      {/* Video Preview Card */}
      <div id="video-info-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm bg-gray-300/10">
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{data.text}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(data?.videoMeta.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{data.locationCreated}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Music className="w-4 h-4" />
                    <span>{data.musicMeta.musicOriginal ? "Original" : "Licensed"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{data.musicMeta.musicName}</p>
                      <p className="text-sm text-gray-600">by {data.musicMeta.musicAuthor}</p>
                    </div>
                    <Badge variant={data.musicMeta.musicOriginal ? "default" : "secondary"}>{data.musicMeta.musicOriginal ? "Original Sound" : "Licensed Music"}</Badge>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Published on {formatDate(data.createTimeISO)} • {data.videoMeta.definition} • {data.videoMeta.format.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <img src={data.videoMeta.coverUrl || "/placeholder.svg"} alt="Video cover" className="w-20 h-28 object-cover rounded-lg border" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.isAd && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Ad
                </Badge>
              )}
              {data.isPinned && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pinned
                </Badge>
              )}
              {data.isSponsored && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Sponsored
                </Badge>
              )}
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {calculateEngagementRate()} Engagement
              </Badge>
            </div>

            {/* Video Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 text-red-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium">Likes</span>
                </div>
                <p className="font-bold text-lg text-red-700">{formatNumber(data.diggCount)}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                  <Play className="w-4 h-4" />
                  <span className="text-xs font-medium">Views</span>
                </div>
                <p className="font-bold text-lg text-blue-700">{formatNumber(data.playCount)}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Comments</span>
                </div>
                <p className="font-bold text-lg text-green-700">{formatNumber(data.commentCount)}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                  <Share className="w-4 h-4" />
                  <span className="text-xs font-medium">Shares</span>
                </div>
                <p className="font-bold text-lg text-purple-700">{formatNumber(data.shareCount)}</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-xs font-medium">Saves</span>
                </div>
                <p className="font-bold text-lg text-orange-700">{formatNumber(data.collectCount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Video Transcript</CardTitle>
              <CardDescription>AI-generated transcript from video audio</CardDescription>
            </CardHeader>
            <CardContent>
              {transcript ? (
                <div className="h-96 w-full rounded-md border p-4 overflow-y-auto bg-gray-50">
                  <p className="text-sm leading-relaxed text-gray-700">{transcript}</p>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Transcript will appear here after analysis</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VideoInfo;
