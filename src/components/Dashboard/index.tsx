"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import VideoInfo from "../VideoInfo";
import AnalysisResults from "../AnalysisResults";
import { Play, ChevronDown, ChevronRight, Eye, Zap, MessageSquare, BookOpen, MousePointer, CheckCircle, Loader2 } from "lucide-react";
import type { AnalysisResult, AnalysisItem } from "../../types/analysis";
import type { TikTokApiResponse } from "../../types/apify";
import { readUIMessageStream } from "ai";

import Link from "next/link";

const DashboardComponent = () => {
  const [url, setUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [videoData, setVideoData] = useState<TikTokApiResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<"get-video" | "upload" | "analyze" | "streaming" | "complete" | "error" | "idle">("idle");

  const toggleSection = (section: string): void => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAnalyze = async (): Promise<void> => {
    if (!url) return;
    setIsAnalyzing(true);
    setStep("get-video");

    try {
      const response = await fetch("/api/get-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const { response: tiktokData } = await response.json();
      console.log("GET VIDEO??>>>>>>>>", response);
      // If array, use first item; else use object
      const videoObj = Array.isArray(tiktokData) ? tiktokData[0] : tiktokData;
      console.log("video obj", videoObj);
      if (response.ok && videoObj) {
        setVideoData(videoObj);

        console.log("Sending to analyze API:", JSON.stringify(videoObj));
        try {
          setStep("analyze");

          // Fetch analysis and transcript from /api/analyze
          const result = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              publicUrl: videoObj?.videoUrl,
              tiktokData: response,
            }),
          });

          const analysisResponse = await result.json();
          console.log("✅ [DashboardAnalysis response received:", analysisResponse);

          if (!result.ok) {
            console.error("❌ [DashboardAnalysis API error:", analysisResponse);
            setStep("error");
            throw new Error(analysisResponse.error || "Failed to analyze video");
          }

          /          // ---- STREAM HANDLING ----
          setStep("streaming");
          let accumulatedPartials: any[] = [];
          let accumulatedTranscript = "";

          console.log("[Dashboard] Starting to receive stream from analysis endpoint...");

          for await (const uiMessage of readUIMessageStream({
            stream: result.body,
          })) {
            console.log("✅ [Dashboard] Received uiMessage:", uiMessage);

            if (uiMessage.type === "text") {
              accumulatedTranscript += uiMessage.text ?? "";
              setTranscript(accumulatedTranscript); // Update transcript in real-time
            } else if (uiMessage.type === "partial") {
              accumulatedPartials.push(uiMessage.partial);
              setAnalysis([...accumulatedPartials]); // Update analysis in real-time
            }
          }

          setStep("complete");
tch (e) {
          console.error("Error analyzing video:", e);
          setTranscript("");
          setAnalysis(null);
          setStep("error");
        }
        /*

 {
        console.error("❌ [DashboardFailed to fetch video data:", response.statusText);
        setTranscript("");
        setAnalysis(null);
        setStep("error");
      }
    } catch (error) {
      console.error("❌ [DashboardError fetching video data:", error);
      setTranscript("");
      setAnalysis(null);
      setStep("error");
    }

    setIsAnalyzing(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  return (
    <div className="pt-[60.8px] px-5 min-h-scre20n w-full">
      {/* Header */}
      <div className="sticky top-[60px] z-50">
        <div id="search" className="px-6 sticky max-w-full mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-between rounded-xl px-5 bg-white h816">
            <div className="flex w-full p-0  bg-white gap-4 ">
              <Input type="url" placeholder="https://www.tiktok.com/@username/video/..." value={url} onChange={handleUrlChange} className="flex-1 text-black z-40" aria-label="TikTok video URL" />
              <Button onClick={handleAnalyze} disabled={!url || isAnalyzing} className="text-white" type="button">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
            div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-0 py-8">
        {/* Video Information Section */}
        <VideoInfo videoData={vanalysis={analysis} ideoData} transcript={transcript} videoUrl={videoData?.videoUrl ?? undefined} />

        {/* Analysis Results Section */}
        <div className="flex items-center justify-between mb-6">
          {analysis && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Analysis Complete
            </Badge>
          )}
        </div>
        <AnalysisResults analysis={analysis} isanalysis{isAnalyzing} />
      </div>
    </div>
  );
};

export default DashboardComponent;
