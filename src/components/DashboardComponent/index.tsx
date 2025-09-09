"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import VideoInfo from "../VideoInfo";
import AnalysisResults from "../AnalysisResults";
import { Play, ChevronDown, ChevronRight, Eye, Zap, MessageSquare, BookOpen, MousePointer, CheckCircle, Loader2 } from "lucide-react";
import type { AnalysisResult, AnalysisItem } from "../../types/analysis";
import type { TikTokApiResponse } from "../../types/apify";
import { AnalysisSchema } from "@/types/analysis";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import ProgressModal from "../ProgressModal";
const DashboardComponent = () => {
  const [url, setUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [videoData, setVideoData] = useState<TikTokApiResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<"get-video" | "upload" | "transcript" | "analyze" | "streaming" | "complete" | "error" | "idle">("idle");
  const [uploadResponse, setUploadResponse] = useState<{ videoUrl?: string }>({});
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // show for all non-idle states except when explicitly closed or on error
    if (step === "idle") return setShowProgress(false);

    if (step === "complete") {
      setShowProgress(true);
      const t = setTimeout(() => setShowProgress(false), 1500); // close after ~1.5s
      return () => clearTimeout(t);
    }

    if (step === "error") {
      setShowProgress(true); // allow user to see error and close manually
      return;
    }

    setShowProgress(true);
  }, [step]);

  // @ts-ignore - Complex type resolution for useObject
  const {
    object,
    submit,
    error: streamError,
    isLoading: isStreaming,
  } = useObject({
    api: "/api/analyze",
    schema: AnalysisSchema,
  });

  useEffect(() => {
    if (object) {
      console.log("🔄 [Dashboard] Partial object update:", object);
      setAnalysis(object as unknown as AnalysisResult);
    }
  }, [object]);

  useEffect(() => {
    if (streamError) {
      console.error("[Dashboard] useObject stream error:", streamError);
      setStep("error");
    }
  }, [streamError]);

  const handleAnalyze = async (): Promise<void> => {
    if (!url) return;
    setIsAnalyzing(true);
    setStep("get-video");

    try {
      // Fetch video data from /api/get-video
      const response = await fetch("/api/get-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const { response: tiktokData } = await response.json();
      // console.log("GET VIDEO??>>>>>>>>", response);

      // If array, use first item; else use object
      const videoObj = Array.isArray(tiktokData) ? tiktokData[0] : tiktokData;
      // console.log("video obj", videoObj, tiktokData);

      if (response.ok && videoObj) {
        setVideoData(videoObj);

        // Get transcript
        let tx = "";
        console.log("Sending to analyze API:", JSON.stringify(videoObj));
        try {
          console.log("[Dashboard] Requesting transcript...");
          setStep("transcript");
          const trRes = await fetch("/api/transcript", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicUrl: videoObj?.videoUrl }),
          });
          const trJson = await trRes.json();
          if (!trRes.ok) {
            console.error("[Dashboard] Transcript API error:", trJson);
            setStep("error");
            setIsAnalyzing(false);
            return; // stop — analysis requires the transcript
          }
          tx = trJson.transcript ?? "";
          console.log("[Dashboard] Transcript received, length:", tx.length);
          setTranscript(tx);
        } catch (e) {
          console.error("[Dashboard] Transcript fetch failed:", e);
          setStep("error");
          setIsAnalyzing(false);
          return;
        }

        try {
          setStep("analyze");

          setStep("streaming");
          console.log("[Dashboard] Starting to stream analysis object via useObject.submit...");
          await submit({
            publicUrl: videoObj?.videoUrl,
            tiktokData: videoObj,
            transcript: tx,
          });

          console.log("[Dashboard] Object stream complete");
          if (!streamError) {
            setStep("complete");
          } else {
            console.error("[Dashboard] Analysis API stream error:", streamError);
            setStep("error");
          }
        } catch (e) {
          console.error("Error analyzing video:", e);
          setTranscript("");
          setAnalysis(null);
          setStep("error");
        }
      } else {
        console.error("[Dashboard] Failed to fetch video data:", response.statusText);
        setTranscript("");
        setAnalysis(null);
        setStep("error");
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching video data:", error);
      setTranscript("");
      setAnalysis(null);
      setStep("error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  return (
    <div className=" min-h-screen w-full">
      {/* Header */}
      <div className="sticky top-[60px] z-50">
        <div id="search" className="px-6 sticky max-w-full mx-auto px-4 sm:px-6 lg:px-0">
          <div id="video-cover" className="flex items-center justify-between rounded-xl px-5 bg-muted/50 h-16">
            <div className="flex w-full p-0  gap-4 ">
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
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-0 py-8">
        {/* Video Information Section */}
        <VideoInfo videoData={videoData} transcript={transcript} videoUrl={videoData?.videoUrl ?? undefined} />

        {/* Analysis Results Section */}
        <div className="flex items-center justify-between mb-6">
          {analysis && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Analysis Complete
            </Badge>
          )}
        </div>
        <AnalysisResults analysis={analysis} isLoading={isAnalyzing} />
      </div>
      <ProgressModal
        open={showProgress}
        step={step}
        onClose={() => {
          // if user closes early, put UI back to idle-ish state (optional)
          setShowProgress(false);
          if (step !== "complete") setStep("idle");
        }}
      />
    </div>
  );
};

export default DashboardComponent;
