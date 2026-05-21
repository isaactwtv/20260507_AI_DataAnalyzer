# AI 數據分析與決策諮詢工具 (AI Data Analyzer & Decision Consultant)

本專案是一個全端（Fullstack）的 AI 數據分析與決策輔助平台。使用者可以上傳或貼上 CSV 格式的報表數據，並透過後端整合的 Google Gemini AI 模型，針對數據進行多維度分析，自動生成高價值的商業發現與行動建議報告。

---

## 🚀 特色功能 (Features)

1. **資料維度與概述**：自動解析 CSV 結構，並呈現資料筆數、欄位特性等統計資訊。
2. **核心發現與關鍵趨勢**：結合強大語意推理，精確找出亮點、異常值（Outliers）與成長趨勢。
3. **商業決策待辦事項 (Action Items)**：研擬高優先度決策清單，並建議負責人角色。
4. **英文商務摘要 (Executive Summary)**：同步輸出高品質的英文版決策摘要，方便跨團隊簡報。
5. **進階自訂提示詞**：支持彈性調整 System Instructions 提示指令以適應不同產業需求。

---

## 🛠️ 技術棧 (Tech Stack)

- **前端 (Frontend)**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **後端 (Backend)**: Node.js, Express, TSX, ESBuild
- **AI 整合 (AI Integration)**: Official Google GenAI SDK (`@google/genai`)

---

## 📦 本地快速啟動 (Getting Started Locally)

### 1. 安裝環境準備

* 確保您的系統已安裝 **Node.js** (建議 v18 以上版本)。

### 2. 安裝專案依賴

```bash
npm install
```

### 3. 配置環境變數

1. 開啟專案根目錄下的 `.env` 檔案。
2. 將您的 Gemini API Key 填入 `GEMINI_API_KEY` 欄位中：
   ```env
   GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
   ```
   *(您可以前往 [Google AI Studio](https://aistudio.google.com/) 免費申請金鑰)*

### 4. 啟動開發伺服器

執行以下指令，將會在本地啟動全端開發伺服器，並同時啟用 Vite HMR：

```bash
npm run dev
```

啟動後，請在瀏覽器開啟: **`http://localhost:3000`**。

---

## 🚢 生產環境建置與部署 (Production Build & Deploy)

### 1. 本地打包測試

在發布前，可以執行打包指令：

```bash
npm run build
```

打包完成後，將會產生前端靜態檔案與後端打包代碼至 `dist` 目錄下。

### 2. 啟動生產環境伺服器

```bash
npm run start
```

### 3. 雲端平台部署

本專案支援一鍵部署至各大雲端託管平台（例如 Render, Fly.io, Heroku 等）：
- **Build Command (建置指令)**: `npm install && npm run build`
- **Start Command (啟動指令)**: `npm run start`
- **環境變數 (Environment Variables)**: 請在平台主面板中配置 `GEMINI_API_KEY` 與 `NODE_ENV=production`。

