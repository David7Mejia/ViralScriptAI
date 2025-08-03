"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Play, ChevronDown, ChevronRight, Eye, Zap, MessageSquare, BookOpen, MousePointer, CheckCircle, Loader2, Link } from "lucide-react";
import type { AnalysisResult, AnalysisItem } from "../types/analysis";

const TikTokAnalyzer =() =>{
  const [url, setUrl] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string): void => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {

    console.log("Current URL:", url);
  }, [url])

  const handleAnalyze = async (): Promise<void> => {
    if (!url) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/get-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok) {
        // Expecting transcript and analysis in response
        setTranscript(data.transcript || "");
        setAnalysis(data.analysis || null);
      } else {
        // Handle error
        setTranscript("");
        setAnalysis(null);
        console.log(data.error || "Failed to analyze video.");
      }
    } catch (error) {
      setTranscript("");
      setAnalysis(null);
      console.log("Network error. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUrl(e.target.value);
  };

  const analysisItems: AnalysisItem[] = [
    { key: "visualElements", title: "Visual Elements", icon: Eye, color: "bg-blue-50 text-blue-700" },
    { key: "hook", title: "Hook Analysis", icon: Zap, color: "bg-yellow-50 text-yellow-700" },
    { key: "context", title: "Context & Timing", icon: MessageSquare, color: "bg-green-50 text-green-700" },
    { key: "storytelling", title: "Storytelling", icon: BookOpen, color: "bg-purple-50 text-purple-700" },
    { key: "cta", title: "Call to Action", icon: MousePointer, color: "bg-orange-50 text-orange-700" },
    { key: "factCheck", title: "Fact Check", icon: CheckCircle, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Content Analyzer</h1>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Input Section */}
        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="w-5 h-5" />
              <span>Analyze TikTok Video</span>
            </CardTitle>
            <CardDescription>Paste a TikTok URL to get detailed content analysis powered by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input type="url" placeholder="https://www.tiktok.com/@username/video/..." value={url} onChange={handleUrlChange} className="flex-1" aria-label="TikTok video URL" />
              <Button onClick={handleAnalyze} disabled={!url || isAnalyzing} className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600" type="button">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Video"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transcript Section */}
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

          {/* Analysis Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
              {analysis && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Analysis Complete
                </Badge>
              )}
            </div>

            {analysis ? (
              <div className="space-y-3">
                {analysisItems.map((item: AnalysisItem) => {
                  const Icon = item.icon;
                  const isOpen: boolean = openSections[item.key] || false;

                  return (
                    <Card key={item.key} className="shadow-sm">
                      <div>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection(item.key)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <CardTitle className="text-base">{item.title}</CardTitle>
                            </div>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                          </div>
                        </CardHeader>
                        {isOpen && (
                          <CardContent className="pt-0">
                            <div className="h-px bg-gray-200 mb-4" />
                            <p className="text-sm text-gray-700 leading-relaxed">{analysis[item.key]}</p>
                          </CardContent>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {analysisItems.map((item: AnalysisItem) => {
                  const Icon = item.icon;

                  return (
                    <Card key={item.key} className="shadow-sm opacity-50">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Analysis results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default TikTokAnalyzer;
