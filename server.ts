import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client to avoid crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 尚未設定，請在專案根目錄的 .env 檔案中配置金鑰。");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
    });
  }
  return aiClient;
}

const DEFAULT_SYSTEM_INSTRUCTION = `
你是一位非常專業、有敏銳商業洞察力的「AI 數據分析與決策諮詢核心」。
你的目標是接收使用者貼上或上傳的 CSV 報表資料，並針對該資料提供一份詳盡、高含金量、結構清晰且容易閱讀的繁體中文分析與洞察報告。

請務必嚴格遵循以下輸出格式與框架：

1. **資料維度與概述**：簡要列出你觀測到的資料結構（高階統計），例如記錄筆數、特徵欄位名稱與推測的資料性質。
2. **核心發現與關鍵趨勢**：用 3 到 5 個重點總結資料中的亮點、異常值（Outliers）、成長趨勢或衰退警訊。請多使用具體的數據比例、增減起伏來佐證。
3. **商業決策待辦事項 (Action Items)**：明確列出接下來的待辦事項與具體建議，以及建議的負責角色（如：營運主管、行銷經理、技術開發）、執行優先度（高、中、低）。
4. **英文摘要版 (English Executive Summary)**：將上述 1~3 點的核心精華內容完整翻譯並精簡整理成專業、流暢的商務英文（以 Executive Summary 形式呈現，包含 Key Dimensions, Crucial Trends, and Actionable Steps）。

請以 Markdown 格式輸出。所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。請確保語調專業、客觀且具備高度商業啟發性。
`;

async function startServer() {
  const app = express();

  // Support larger body payload for rich CSV spreadsheets
  app.use(express.json({ limit: "15mb" }));

  // API router for health checks
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API route for AI Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { csvContent, customInstruction, modelType = "gemini-3.5-flash" } = req.body;

      if (!csvContent || typeof csvContent !== "string" || csvContent.trim() === "") {
        return res.status(400).json({ error: "無效的內容，請貼上或上傳 CSV 資料。" });
      }

      // Initialize client lazily to output cleaner error message if unconfigured
      const ai = getGeminiClient();

      const sysInstruction = customInstruction && customInstruction.trim() !== ""
        ? customInstruction
        : DEFAULT_SYSTEM_INSTRUCTION;

      // Call Gemini API using the official stable @google/genai syntax
      const response = await ai.models.generateContent({
        model: modelType,
        contents: `以下是需要分析的 CSV 報表內容：\n\n\`\`\`csv\n${csvContent}\n\`\`\``,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.2, // Low temperature for factual data analysis
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("AI 未能產生有效的分析結果。請重試或更換資料集。");
      }

      return res.json({
        success: true,
        result: text,
        modelUsed: modelType,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("Gemini API server error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "發生未知的伺服器錯誤資料處理失敗。"
      });
    }
  });

  // Vite middleware pipeline for development process
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production output asset binding
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
