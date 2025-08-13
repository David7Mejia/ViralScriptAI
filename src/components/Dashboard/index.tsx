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
import hormoziJson from "../../app/hormozi-json.json";
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
  const [uploadResponse, setUploadResponse] = useState<{ videoUrl?: string }>({});

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
      // Fetch video data from /api/get-video
      const response = await fetch("/api/get-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const { response: tiktokData } = await response.json();
      // If array, use first item; else use object
      const videoObj = Array.isArray(tiktokData) ? tiktokData[0] : tiktokData;

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
              publicUrl: videoObj.videoUrl,
              prompt: "Analyze this video and return STRICT JSON with { visualElements, hook, context, cta } and MM:SS timestamps.",
            }),
          });

          const analysisResponse = await result.json();
          console.log("✅ [Dashboard] Analysis response received:", analysisResponse);

          if (!result.ok) {
            console.error("❌ [Dashboard] Analysis API error:", analysisResponse);
            setStep("error");
            throw new Error(analysisResponse.error || "Failed to analyze video");
          }

          // Update state with analysis and transcript
          const { analysis, transcript } = analysisResponse;
          console.log("analysis transcript", analysis, transcript);
          setAnalysis(analysis);
          setTranscript(transcript);
          setStep("complete");
        } catch (e) {
          console.error("Error analyzing video:", e);
          setTranscript("");
          setAnalysis(null);
          setStep("error");
        }
        /*
        try {
          setStep("upload");
          const uploadToSupabase = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(videoObj),
          });

          if (!uploadToSupabase.ok) {
            const errorData = await uploadToSupabase.json();
            console.error("Upload to Supabase failed:", uploadToSupabase.status, errorData);
            setStep("error");
          } else {
            const response = await uploadToSupabase.json();
            setUploadResponse(response);
            console.log("Upload success:", response);

            // ---- NEW: stream analysis using the publicUrl returned by /api/upload ----
            try {
              setStep("analyze");
              const result = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  publicUrl: response.videoUrl,
                  prompt: "Analyze this video and return STRICT JSON with { visualElements, hook, context, cta } and MM:SS timestamps.",
                }),
              });

              if (!result.ok || !result.body) {
                const analysisResponse = await result.json().catch(() => ({}));
                console.error("Analysis API error:", analysisResponse);
                setStep("error");
                throw new Error(analysisResponse.error || "Failed to analyze video");
              }

              // ---- STREAM (docs-style parts.forEach) ----
              setStep("streaming");
              let acc = "";
              console.log("🔄 [Dashboard] Starting to receive stream from analysis endpoint...");

              try {
                const stream = result.body as unknown as ReadableStream<any>; // satisfy TS for readUIMessageStream
                console.log("📥 [Dashboard] Stream object received:", !!stream);

                if (!stream) {
                  throw new Error("No stream returned from API");
                }

                console.log("📡 [Dashboard] Starting readUIMessageStream...");

                // @ts-ignore - body is a byte stream; runtime decoding is handled internally
                for await (const uiMessage of readUIMessageStream({ stream })) {
                  console.log("✅ [Dashboard] Received uiMessage:", uiMessage);

                  if (!uiMessage.parts || !Array.isArray(uiMessage.parts)) {
                    console.warn("⚠️ [Dashboard] Message has no parts array:", uiMessage);
                    continue;
                  }

                  console.log(`📊 [Dashboard] Processing ${uiMessage.parts.length} parts in message`);

                  uiMessage.parts.forEach((part: any, index: number) => {
                    console.log(`📦 [Dashboard] Processing part ${index} of type ${part.type}`);

                    switch (part.type) {
                      case "text": {
                        console.log(`📝 [Dashboard] Text part received (${part.text?.length || 0} chars):`, part.text?.substring(0, 100));
                        acc += part.text ?? "";
                        setTranscript(acc); // live preview
                        break;
                      }
                      case "tool-call": {
                        console.log("🔧 [Dashboard] Tool called:", part.toolName, "with args:", part.args);
                        break;
                      }
                      case "tool-result": {
                        console.log("🔧 [Dashboard] Tool result:", part.result);
                        break;
                      }
                      default:
                        console.log("❓ [Dashboard] Unknown part type:", part.type);
                        break;
                    }
                  });

                  console.log("📋 [Dashboard] Current accumulated text:", acc.substring(0, 100) + (acc.length > 100 ? "..." : ""));
                }

                console.log("✅ [Dashboard] Stream processing complete");
              } catch (streamError) {
                console.error("❌ [Dashboard] Error processing stream:", streamError);
                setTranscript("Error processing response stream: " + String(streamError));
              }

              try {
                console.log("🧩 [Dashboard] Stream complete, attempting to parse JSON");
                console.log("📄 [Dashboard] Raw accumulated text:", acc);

                if (!acc || acc.trim() === "") {
                  console.error("❌ [Dashboard] Empty response from stream");
                  setTranscript("Received empty response from analysis API");
                  setStep("error");
                  return;
                }

                // Try to find JSON in the text (in case there's any text wrapper)
                let jsonText = acc;
                const jsonStartPos = acc.indexOf("{");
                const jsonEndPos = acc.lastIndexOf("}");

                if (jsonStartPos > -1 && jsonEndPos > -1 && jsonEndPos > jsonStartPos) {
                  jsonText = acc.substring(jsonStartPos, jsonEndPos + 1);
                  console.log("🔍 [Dashboard] Extracted potential JSON:", jsonText);
                }

                const parsed = JSON.parse(jsonText);
                console.log("✅ [Dashboard] Successfully parsed JSON:", parsed);
                setAnalysis(parsed);
                setTranscript("");
                setStep("complete");
              } catch (parseError) {
                console.error("❌ [Dashboard] Failed to parse analysis response as JSON:", parseError);
                console.log("📄 [Dashboard] Raw response:", acc);
                setAnalysis(null);
                setTranscript(acc); // Show the raw text since we couldn't parse JSON
                console.warn("⚠️ [Dashboard] Analysis was not valid JSON. Showing raw text in transcript.");
                setStep("complete");
              }
            } catch (e) {
              console.error("Error analyzing video:", e);
              setTranscript("");
              setAnalysis(null);
              setStep("error");
            }
            // -------------------------------------------------------------------------
          }
        } catch (uploadError) {
          console.error("Error uploading to Supabase:", uploadError);
          setStep("error");
        }
*/
        // (Old commented code preserved)
        // const { transcript, analysis } = await analysisResponse.json();
        // setTranscript(transcript);
        // setAnalysis(analysis);
      } else {
        console.error("❌ [Dashboard] Failed to fetch video data:", response.statusText);
        setTranscript("");
        setAnalysis(null);
        setStep("error");
      }
    } catch (error) {
      console.error("❌ [Dashboard] Error fetching video data:", error);
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
    <div className="pt-[60.8px] px-5 min-h-screen w-full">
      {/* Header */}
      <div className="sticky top-[60px] z-50">
        <div id="search" className="px-6 sticky max-w-full mx-auto px-4 sm:px-6 lg:px-0">
          <div className="flex items-center justify-between rounded-xl px-5 bg-white h-16">
            {/* <div className="flex items-center space-x-3 w-full">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Content Analyzer</h1>
            </div> */}
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
            {/* <Badge variant="secondary" className="bg-green-100 text-green-800">
              AI Powered
            </Badge> */}
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
    </div>
  );
};

export default DashboardComponent;
