import React from "react";

export interface AnalysisResult {
  sentiment: "positive" | "neutral" | "negative"; // Sentiment is a string with specific values
  structure: {
    hook: string;
    problem: string;
    story: string;
    payoff: string;
    cta: string;
  };
  topics: string[]; // Array of strings for topics
  keywords: string[]; // Array of strings for keywords
  summary: string; // Summary is a string
}

export type AnalysisItem = {
  key: keyof AnalysisResult;
  title: string;
  icon: React.ElementType;
  color: string;
};

export type MetricItem = {
  icon: React.ElementType;
  color: string;
  metric: number;
  label: string;
};

export type ColorMetric = {
  icon: React.ElementType;
  metric: number;
  label: string;
  color: string;
  text: string;
  metricColor: string;
};
