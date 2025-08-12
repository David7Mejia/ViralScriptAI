import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, Target, Brain, Star, TrendingUp, Smile } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

interface AnalysisResultsProps {
  analysis?: AnalysisResult | null;
  isLoading?: boolean;
}
interface AnalysisSectionProps {
  icon: React.ElementType;
  title: string;
  content?: string;
  color: string;
  bgColor: string;
}

const AnalysisSection = ({ icon: Icon, title, content, color, bgColor }: AnalysisSectionProps) => (
  <div className={`p-4 rounded-lg ${bgColor} border-l-4 ${color.includes("border-l-") ? color : "border-l-" + color}`}>
    <div className="flex items-center mb-2">
      <Icon className={`w-5 h-5 mr-2 ${color.includes("text-") ? color.split(" ").find(c => c.startsWith("text-")) : ""}`} />
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{content || "Analysis not available for this section."}</p>
  </div>
);

const AnalysisResults = ({ analysis, isLoading }: AnalysisResultsProps) => {
  // Debug logging to see what data we're getting
  React.useEffect(() => {
    console.log("🔍 [AnalysisResults] Analysis data:", analysis);

    if (analysis) {
      console.log("✅ [AnalysisResults] Analysis keys:", Object.keys(analysis));
      console.log("📊 [AnalysisResults] Content samples:");
      if (analysis.hook) console.log("- Hook:", analysis.hook.substring(0, 50) + "...");
      if (analysis.context) console.log("- Context:", analysis.context.substring(0, 50) + "...");
      if (analysis.cta) console.log("- CTA:", analysis.cta.substring(0, 50) + "...");
      if (analysis.visualElements) console.log("- Visual:", analysis.visualElements.substring(0, 50) + "...");
      if (analysis.engagement_factors) console.log("- Factors:", analysis.engagement_factors);
    }
  }, [analysis]);

  // Loading skeleton (simple version)
  if (isLoading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-16 w-full rounded-lg bg-gray-200 animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="space-y-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-pink-500" />
            AI Content Analysis
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <Star className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        </div>
        <p className="text-sm text-gray-500">AI-powered insights into content structure and effectiveness</p>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {/* Main Analysis Sections */}
        <AnalysisSection icon={Zap} title="Hook Analysis" content={analysis?.hook} color="border-l-yellow-500 text-yellow-500" bgColor="bg-yellow-50" />

        <AnalysisSection icon={MessageSquare} title="Context & Structure" content={analysis?.context} color="border-l-blue-500 text-blue-500" bgColor="bg-blue-50" />

        <AnalysisSection icon={Target} title="Call-to-Action" content={analysis?.cta} color="border-l-green-500 text-green-500" bgColor="bg-green-50" />

        {/* Additional Analysis Data */}
        {(analysis?.engagement_factors || analysis?.sentiment || analysis?.tone) && (
          <div className="space-y-4 pt-4 border-t">
            {/* Engagement Factors */}
            {analysis?.engagement_factors && (
              <div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                  <h5 className="font-medium text-gray-800">Key Engagement Factors</h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.engagement_factors.map((factor: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment & Tone */}
            {(analysis?.sentiment || analysis?.tone) && (
              <div className="grid grid-cols-2 gap-4">
                {analysis?.sentiment && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Smile className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Sentiment</p>
                    <p className="font-semibold text-green-600">{analysis.sentiment}</p>
                  </div>
                )}
                {analysis?.tone && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Tone</p>
                    <p className="font-semibold text-blue-600">{analysis.tone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Debug information - Uncomment when needed */}
        {/* <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h5 className="font-medium text-gray-800 mb-2">Debug Information</h5>
          <pre className="text-xs overflow-auto p-2 bg-white rounded border max-h-40">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
