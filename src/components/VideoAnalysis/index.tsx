"use client";

import { useState } from "react";

interface VideoAnalysisProps {
  videoId: string;
}

export default function VideoAnalysis({ videoId }: VideoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze video");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Analysis</h3>
        <button
          onClick={analyzeVideo}
          disabled={isAnalyzing}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Content"}
        </button>
      </div>

      {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}

      {analysis && (
        <div className="p-4 border rounded-md bg-gray-50">
          <h4 className="mb-2 text-md font-medium">Analysis Results</h4>
          <div className="prose prose-sm max-w-none">
            {analysis.split("\n").map((line, i) => (
              <p key={i} className={line.trim().length === 0 ? "my-4" : ""}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
