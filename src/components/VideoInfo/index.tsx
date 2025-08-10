import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Heart, Share, Play, MessageCircle, Bookmark, Users, Clock, CheckCircle, MapPin, Music } from "lucide-react";
import type { ApifyData } from "../../types/apify";
import type { JSX } from "react";
import { useState } from "react";
import CreatorStats from "../CreatorStats";
import { ColorMetric } from "@/types/analysis";

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

  const colorMetrics: ColorMetric[] = [
    { icon: Heart, metric: data.diggCount || 0, label: "Likes", color: "bg-red-50", text: "text-red-600", metricColor: "text-red-700" },
    { icon: Play, metric: data.playCount || 0, label: "Views", color: "bg-blue-50", text: "text-blue-600", metricColor: "text-blue-700" },
    { icon: MessageCircle, metric: data.commentCount || 0, label: "Comments", color: "bg-green-50", text: "text-green-600", metricColor: "text-green-700" },
    { icon: Share, metric: data.shareCount || 0, label: "Shares", color: "bg-purple-50", text: "text-purple-600", metricColor: "text-purple-700" },
    { icon: Bookmark, metric: data.collectCount || 0, label: "Saves", color: "bg-orange-50", text: "text-orange-600", metricColor: "text-orange-700" },
  ];
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
        <div id="video-col" className="p-6 rounded-xl shadow-sm bg-gray-300/10">
          <div className="flex items-start justify-between">
            <div id="video-cover-container" className="glow-aura flex-1 h-full">
              <img id="video-cover" src={data?.videoMeta?.coverUrl || "/placeholder.svg"} alt="Video cover" className="max-w-mdobject-cover rounded-lg" />
            </div>

            {/* Video Metrics */}

            <div className="flex-1">
              <div className="flex flex-col max-w-30 gap-y-3 ml-auto">
                {data?.authorMeta &&
                  colorMetrics.map((item: ColorMetric, index) => (
                    <div key={index} className={`${item.color} rounded-lg p-3 text-center`}>
                      <div className={`flex items-center justify-center space-x-1 ${item.text} mb-1`}>
                        <item.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <p className={`font-bold text-lg ${item.metricColor}`}>{formatNumber(item.metric)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div>
            {/* <div className="flex flex-wrap gap-2 mb-4">
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
            </div> */}

            <h3 id="video-caption" className="font-semibold text-lg my-2 text-white">
              {data.text}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-white">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">{formatDuration(data?.videoMeta.duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">{data.locationCreated}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Music className="w-4 h-4" />
                  <p className="text-xs">
                    {data.musicMeta.musicName} by {data.musicMeta.musicAuthor}
                  </p>
                </div>
                {/* <Badge variant={data.musicMeta.musicOriginal ? "default" : "secondary"}>{data.musicMeta.musicOriginal ? "Original Sound" : "Licensed Music"}</Badge> */}
              </div>
              <div className="text-xs text-white">Posted {formatDate(data.createTimeISO)}</div>
            </div>
          </div>
        </div>

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
