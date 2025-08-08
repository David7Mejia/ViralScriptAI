"use client";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Users, Heart, Play, CheckCircle } from "lucide-react";
import { MetricItem } from "@/types/analysis";

interface CreatorStatsProps {
  authorMeta: {
    name?: string;
    avatar?: string;
    profileUrl?: string;
    nickName?: string;
    verified?: boolean;
    signature?: string;
    fans?: number;
    heart?: number;
    video?: number;
    following?: number;
  };
  formatNumber: (num?: number) => string;
}

const CreatorStats = ({ authorMeta, formatNumber }: CreatorStatsProps) => {
  const metricItems: MetricItem[] = [
    { icon: Users, color: "text-pink-50", metric: authorMeta.fans || 0, label: "Followers" },
    { icon: Heart, color: "text-red-50", metric: authorMeta.heart || 0, label: "Total Likes" },
    { icon: Play, color: "text-blue-50", metric: authorMeta.video || 0, label: "Videos" },
    { icon: Users, color: "text-green-50", metric: authorMeta.following || 0, label: "Following" },
  ];

  return (
    <Card className="flex-1 shadow-sm bg-black text-white">
      <CardHeader>
        <CardTitle className="flex items-top space-x-10">
          <div className="w-60 h-60 rounded-full overflow-hidden bg-gray-200 ">
            <img src={authorMeta?.avatar || "/placeholder.svg"} alt={authorMeta.nickName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 flex flex-col gap-y-[10px]">
            <section id="subheading">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-white font-bold text-xl">@{authorMeta.name}</p>
                {authorMeta.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-md">{authorMeta.nickName}</h3>
                <a href={authorMeta.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                  View Profile →
                </a>
              </div>
            </section>
            <section id="creator-metrics" className="w-full">
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {authorMeta &&
                  metricItems.map((item: MetricItem, index) => (
                    <div key={`metric-${index}`} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p className="font-bold">{formatNumber(item.metric)}</p>
                    </div>
                  ))}
              </div>
            </section>
            <section id="bio-description">
              {authorMeta.signature && (
                <div className="">
                  <p className="text-sm text-white whitespace-pre-line">{authorMeta.signature}</p>
                </div>
              )}
            </section>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default CreatorStats;
