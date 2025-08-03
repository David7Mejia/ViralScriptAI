"use client";

import { useState, useCallback } from "react";
import type { AnalysisResult } from "../types/analysis";

interface UseAnalysisReturn {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeVideo: (url: string) => Promise<void>;
  resetAnalysis: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = useCallback(async (url: string): Promise<void> => {
    if (!url) {
      setError("URL is required");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // TODO: Replace with actual Gemini API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockAnalysis: AnalysisResult = {
        visualElements: "Clean, well-lit background with minimal distractions...",
        hook: "Opens with a relatable problem statement...",
        context: "Productivity and self-improvement niche...",
        storytelling: "Follows a clear problem-solution narrative structure...",
        cta: "Clear and direct call-to-action...",
        factCheck: "Claims about productivity statistics appear to be general knowledge...",
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback((): void => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeVideo,
    resetAnalysis,
  };
}
