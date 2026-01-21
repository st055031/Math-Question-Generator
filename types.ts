
export interface ProblemContent {
  text: string;
  answer: string;
  imagePrompt?: string; // 用於生成變體圖片的提示詞
  imageUrl?: string;    // 生成後的圖片 base64 或 URL
}

export interface MathProblemSet {
  id: number;
  original: ProblemContent;
  variations: ProblemContent[];
  hasFigure: boolean;   // 標記此題目是否包含圖形
}

export interface AnalysisResult {
  problems: MathProblemSet[];
}
