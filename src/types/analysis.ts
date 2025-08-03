export type AnalysisResult = {
  visualElements: string;
  hook: string;
  context: string;
  storytelling: string;
  cta: string;
  factCheck: string;
};

export type AnalysisItem = {
  key: keyof AnalysisResult;
  title: string;
  icon: React.ElementType;
  color: string;
};
