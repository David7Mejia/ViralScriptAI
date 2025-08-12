import React, { useState } from "react";
import { Copy, Check, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TranscriptInfoProps {
  transcript?: string;
  isLoading?: boolean;
}

const TranscriptInfo = ({ transcript, isLoading }: TranscriptInfoProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Calculate word count and estimated reading time
  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  if (isLoading) {
    return (
      <Card className="shadow-sm h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          Video Transcript
        </CardTitle>
        <div className="flex items-center space-x-2">
          {transcript && (
            <>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {readingTime} min read
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-500 hover:text-pink-500">
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {transcript ? (
          <div className="h-72 overflow-y-auto pr-2">
            <div className="space-y-3">
              {/* Transcript stats */}
              <div className="flex items-center text-xs text-gray-500 space-x-4 pb-2 border-b">
                <span>{wordCount} words</span>
                <span>AI-generated</span>
                <span className="text-green-600">✓ Processed</span>
              </div>
              {/* Transcript content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-72 text-center">
            <div className="space-y-3">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <h4 className="font-medium text-gray-800">No Transcript Available</h4>
                <p className="text-sm text-gray-500 mt-1">The transcript will appear here after video analysis</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptInfo;
