
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * 分析圖片中的數學題，並準備變體的圖片提示詞
 */
export const analyzeMathProblems = async (base64Image: string): Promise<AnalysisResult> => {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      problems: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            hasFigure: { type: Type.BOOLEAN, description: "題目是否包含幾何圖形、函數圖形或統計圖表？" },
            original: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "原始題目文字。數學式需用 \\( ... \\) 包裹。" },
                answer: { type: Type.STRING, description: "正確解答。數學式需用 \\( ... \\) 包裹。" }
              },
              required: ["text", "answer"]
            },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "變體題目文字。數值必須與原題不同，且邏輯嚴謹。" },
                  answer: { type: Type.STRING, description: "變體題目的解答。" },
                  imagePrompt: { 
                    type: Type.STRING, 
                    description: "針對此變體題目的詳細英文繪圖描述。必須包含此題目中特定的數值標註與幾何特徵。" 
                  }
                },
                required: ["text", "answer"]
              }
            }
          },
          required: ["id", "hasFigure", "original", "variations"]
        }
      }
    },
    required: ["problems"]
  };

  const prompt = `
    請深度分析這張數學題目圖片，並嚴格遵守以下邏輯與數學規範：

    1. **題目識別與代數檢查**：
       - 精確提取原題文字與數值。
       - 檢查代數變數（如 x, y, a, b）的使用。確保理解每個變數在題目的物理或幾何意義。

    2. **變體生成邏輯（避免重複與邏輯錯誤）**：
       - 為每個原題生成 3 個變體。
       - **數值變更**：變體的已知數值必須與原題不同，且避免變體之間數值過於接近。
       - **代數多樣性**：如果原題使用 \\(x\\)，變體可以嘗試使用 \\(y\\)、\\(z\\) 或 \\(a\\) 等不同變數，以增加練習廣度。
       - **邏輯檢驗**：
         - 若為三角形，變體數值必須符合三角形邊長性質（兩邊之和高於第三邊）。
         - 若為分式，分母不可為 0。
         - 若為對數或根號，確保定義域合法。
         - 確保計算結果為簡潔的常數、分數或根式，避免出現無理數循環小數。

    3. **圖片關聯性（hasFigure）**：
       - 若原題有圖（幾何、座標、圖表），請將 hasFigure 設為 true。
       - **imagePrompt 規範**：請針對「該變體」的具體數值撰寫詳細的英文描述。
         - 例如：若原題是半徑為 3 的圓，變體 A 是半徑為 5 的圓，則變體 A 的 imagePrompt 必須明確寫出 "A circle with radius 5 marked as 'r=5'..."。
         - 描述必須包含：幾何形狀、標籤（A, B, C 等）、具體長度或角度標註、線條類型（實線、虛線）。

    4. **格式要求**：
       - 所有數學符號（包含單個變數 \\(x\\)）必須用 \\( ... \\) 包裹。
       - 繁體中文輸出。
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-001',
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  return JSON.parse(response.text || "{}") as AnalysisResult;
};

/**
 * 根據提示詞生成精確的變體題目圖形
 */
export const generateProblemImage = async (prompt: string): Promise<string | undefined> => {
  try {
    // 增加風格限定，確保生成的圖形像數學考卷插圖
    const finalPrompt = `Professional mathematical diagram for a school exam, black and white ink style, high contrast, clean white background, sharp lines, clear text labels. Diagram description: ${prompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001',
      contents: [{ parts: [{ text: finalPrompt }] }],
      config: {
        imageConfig: { 
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("圖片生成失敗，跳過此圖片:", error);
  }
  return undefined;
};
