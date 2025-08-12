import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Heart, Share, MessageCircle, Bookmark, Play, Pause, Volume2, VolumeX, Maximize, Users, Clock, CheckCircle, MapPin, Calendar, Music } from "lucide-react";
import type { ApifyData, TikTokApiResponse } from "../../types/apify";
import type { JSX } from "react";
import { useState } from "react";
import CreatorStats from "../CreatorStats";
import { ColorMetric } from "@/types/analysis";
import TranscriptInfo from "../TranscriptInfo";
import { format } from "date-fns";

interface VideoInfoProps {
  videoData?: TikTokApiResponse | TikTokApiResponse[] | null | undefined;
  transcript?: string;
  videoUrl?: string;
}

function VideoInfo({ videoData, transcript, videoUrl }: VideoInfoProps): JSX.Element {
  // If array, use first item; else use object; fallback to empty object
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const data: any = Array.isArray(videoData) ? videoData[0] : videoData || {};
  // const [transcript, setTranscript] = useState<string>("");

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
    { icon: Heart, metric: data.videoLikes || 0, label: "Likes", color: "bg-red-50", text: "text-red-600", metricColor: "text-red-700" },
    { icon: Play, metric: data.videoPlays || 0, label: "Views", color: "bg-blue-50", text: "text-blue-600", metricColor: "text-blue-700" },
    { icon: MessageCircle, metric: data.videoComments || 0, label: "Comments", color: "bg-green-50", text: "text-green-600", metricColor: "text-green-700" },
    { icon: Share, metric: data.videoShares || 0, label: "Shares", color: "bg-purple-50", text: "text-purple-600", metricColor: "text-purple-700" },
    { icon: Bookmark, metric: data.videoSaves || 0, label: "Saves", color: "bg-orange-50", text: "text-orange-600", metricColor: "text-orange-700" },
  ];
  const calculateEngagementRate = (): string => {
    const totalEngagements = (data.videoLikes || 0) + (data.videoComments || 0) + (data.videoShares || 0);
    const rate = data.videoPlays ? (totalEngagements / data.videoPlays) * 100 : 0;
    return rate.toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      {/* Author Information */}
      <CreatorStats videoData={data} formatNumber={formatNumber} />

      {/* Video Preview Card */}
      <div id="video-info-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* <div id="video-col" className="p-6 rounded-xl shadow-sm bg-white">
          <div className="flex items-start justify-between">
            <div id="video-cover-container" className="glow-aura flex-1 h-full">
              <img id="video-cover" src={data.thumbnailUrl || "/placeholder.svg"} alt="Video cover" className="max-w-mdobject-cover rounded-lg" />
            </div> */}

        {/* Video Metrics */}

        {/* <div className="flex-1">
              <div className="flex flex-col max-w-30 gap-y-3 ml-auto">
                {colorMetrics.map((item: ColorMetric, index) => (
                  <div key={index} className={`${item.color} rounded-lg p-3 text-center`}>
                    <div className={`flex items-center justify-center space-x-1 ${item.text} mb-1`}>
                      <item.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <p className={`font-bold text-lg ${item.metricColor}`}>{formatNumber(item.metric)}</p>
                  </div>
                ))}
              </div>
            </div> */}
        {/* </div>
          <div> */}

        {/* <h3 id="video-caption" className="font-semibold text-lg my-2 text-white">
              {data.caption}
            </h3> */}
        {/* <div className="flex items-center space-x-4 text-sm text-white">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs text-gray-700">{formatDuration(data.duration ?? 0)}</span>
              </div> */}
        {/* TikTokApiResponse does not have locationCreated or musicMeta, so omit those */}
        {/* <div className="text-xs text-gray-700">Posted {formatDate(data.createdAt ?? undefined)}</div>
            </div>
          </div>
        </div> */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">TikTok Video</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(data?.duration)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {data?.createdAt ? formatDate(data?.createdAt ?? undefined) : "Today"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Player Area */}
            <div id="video-cover" className="object-cover relative bg-black border rounded-lg overflow-hidden aspect-[9/16] max-h-96">
              {videoUrl && isPlaying ? (
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls={true}
                  autoPlay={true}
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => videoUrl && setIsPlaying(true)}>
                  {data?.thumbnailUrl ? (
                    <>
                      <img src={data.thumbnailUrl} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                          <p className="text-sm ">TikTok Video Player</p>
                          <p className="text-xs mt-1">{videoUrl ? "Click to play" : "Video not available"}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-950 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        <p className="text-sm opacity-80">TikTok Video Player</p>
                        <p className="text-xs opacity-60 mt-1">{videoUrl ? "Click to play" : "Video not available"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Controls Overlay - Only show if not using native controls and not playing */}
              {!isPlaying && (
                <div className="grid grid-cols-2 h-full">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-3">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={() => videoUrl && setIsPlaying(!isPlaying)} disabled={!videoUrl}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <span className="text-xs">0:00 / {formatDuration(data?.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={() => setIsMuted(!isMuted)}>
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        {/* <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2">
                          <Maximize className="w-4 h-4" />
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* --- Metrics Row --- */}
            <div className="flex flex-wrap gap-3 mb-2">
              {colorMetrics.map((item: ColorMetric, index) => (
                <div key={index} className={`${item.color} rounded-lg px-4 py-2 text-center min-w-[90px]`}>
                  <div className={`flex items-center justify-center space-x-1 ${item.text} mb-1`}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <p className={`font-bold text-lg ${item.metricColor}`}>{formatNumber(item.metric)}</p>
                </div>
              ))}
            </div>
            {/* --- End Metrics Row --- */}
            {/* Video Description */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">{data?.caption || "No description available"}</p>
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Original URL</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <a href={data?.webVideoUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:text-pink-700 break-all">
                  {data?.webVideoUrl || "No URL"}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* TRANSCRIPT INFO SHOLD GO HERE  */}
          <TranscriptInfo transcript={transcript} />
        </div>
      </div>
    </div>
  );
}

export default VideoInfo;
