import React from "react";
import { z } from "zod";

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

export const AnalysisSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  structure: z.object({
    hook: z.string().default(""),
    problem: z.string().default(""),
    story: z.string().default(""),
    payoff: z.string().default(""),
    cta: z.string().default(""),
  }),
  topics: z.array(z.string()).max(12).default([]),
  keywords: z.array(z.string()).max(24).default([]),
  summary: z.string().default(""),
});
