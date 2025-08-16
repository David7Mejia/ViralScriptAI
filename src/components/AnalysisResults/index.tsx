import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, Target, Brain, Star, TrendingUp, Smile, FileText, Hash, Lightbulb, Tag } from "lucide-react";
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
const StructureSection = ({ icon: Icon, title, content, color, bgColor }) => (
  <div className={`p-4 rounded-xl ${bgColor} border border-gray-100 hover:shadow-sm transition-all duration-200`}>
    <div className="flex items-start space-x-3">
      <div className={`p-2 rounded-lg ${bgColor} border ${color.replace("text-", "border-")}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{content || "Analysis not available for this section."}</p>
      </div>
    </div>
  </div>
);

const SummaryCard = ({ title, content, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-all duration-200">
    <div className="flex items-center mb-2">
      <Icon className={`w-5 h-5 mr-2 ${color}`} />
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
  </div>
);


const AnalysisResults = ({ analysis, isLoading }: AnalysisResultsProps) => {

  return (
    <>
      <Card className="shadow-sm h-full flex flex-col">
        <CardHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Brain className="w-5 h-5 mr-2 text-pink-500" />
              AI Content Analysis
            </CardTitle>
            {isLoading ? (
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="flex items-center space-x-2">
                {analysis?.sentiment && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 capitalize">
                    <Smile className="w-3 h-3 mr-1" />
                    Sentiment: {analysis.sentiment}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">AI-powered breakdown of content structure and key elements</p>
        </CardHeader>

        <CardContent className="space-y-6 flex-grow">
          {/* Content Structure Analysis */}
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-16 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>
              ))}
            </>
          ) : (
            <>
              {analysis?.structure && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    Content Structure
                  </h3>

                  <div className="grid gap-3">
                    {analysis?.structure?.hook && <StructureSection icon={Zap} title="Hook" content={analysis?.structure?.hook} color="text-amber-600" bgColor="bg-amber-50" />}

                    {analysis?.structure?.problem && <StructureSection icon={Target} title="Problem" content={analysis?.structure?.problem} color="text-red-600" bgColor="bg-red-50" />}

                    {analysis?.structure?.story && <StructureSection icon={MessageSquare} title="Story/Solution" content={analysis?.structure?.story} color="text-blue-600" bgColor="bg-blue-50" />}

                    {analysis?.structure?.payoff && <StructureSection icon={Lightbulb} title="Payoff/Value" content={analysis?.structure?.payoff} color="text-green-600" bgColor="bg-green-50" />}

                    {analysis?.structure?.cta && <StructureSection icon={TrendingUp} title="Call-to-Action" content={analysis?.structure?.cta} color="text-purple-600" bgColor="bg-purple-50" />}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Content Summary */}
          {analysis?.summary && <SummaryCard title="Content Summary" content={analysis?.summary} icon={FileText} color="text-indigo-600" />}

          {/* Topics & Keywords */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Topics */}
            {analysis?.topics && (
              <div>
                <div className="flex items-center mb-3">
                  <Hash className="w-4 h-4 mr-2 text-blue-500" />
                  <h5 className="font-semibold text-gray-900">Topics</h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 capitalize">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {analysis?.keywords && (
              <div>
                <div className="flex items-center mb-3">
                  <Tag className="w-4 h-4 mr-2 text-purple-500" />
                  <h5 className="font-semibold text-gray-900">Keywords</h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AnalysisResults;

// https://www.tiktok.com/@ahormozi/video/7386094697229405482
