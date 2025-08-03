import type React from "react";

export interface AnalysisResult {
  visualElements: string;
  hook: string;
  context: string;
  storytelling: string;
  cta: string;
  factCheck: string;
}

export interface AnalysisItem {
  key: keyof AnalysisResult;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface AnalysisState {
  url: string;
  transcript: string;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  openSections: Record<string, boolean>;
}
