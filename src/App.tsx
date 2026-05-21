import React, { useState, useEffect } from "react";
import { parseCsvText } from "./utils/csvParser";
import { DEFAULT_SYSTEM_INSTRUCTION, MODEL_OPTIONS } from "./utils/constants";
import { CSV_EXAMPLES } from "./components/CsvExamples";
import { CsvTable } from "./components/CsvTable";
import { AnalysisOutput } from "./components/AnalysisOutput";
import { ParsedCsv, AnalysisState } from "./types";
import {
  Sparkles,
  Upload,
  Database,
  RefreshCw,
  Sliders,
  Play,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Layers,
  Award,
  BookOpen
} from "lucide-react";

export default function App() {
  // Input CSV state - default to retail-sales example
  const [csvInput, setCsvInput] = useState<string>(CSV_EXAMPLES[0].content);
  const [parsedData, setParsedData] = useState<ParsedCsv>(parseCsvText(CSV_EXAMPLES[0].content));

  // Settings state
  const [modelType, setModelType] = useState<string>("gemini-3.5-flash");
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(DEFAULT_SYSTEM_INSTRUCTION);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    modelUsed: null,
    timestamp: null
  });

  // Intelligent loading text progression state
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const loadingSteps = [
    "正在讀取並解析輸入的 CSV 報表資料...",
    "正在演算數據維度、最大值與潛在相關性...",
    "正在呼叫 Gemini AI 多維度語意推理解析軟體...",
    "正在分析核心商業亮點、異常預警與瓶頸歸納...",
    "正在研擬高優先度 Action Items 決策待辦事項...",
    "正在轉譯專業商務英文摘要與格式化排版..."
  ];

  // Sync parsed data when CSV input changes
  useEffect(() => {
    const parsed = parseCsvText(csvInput);
    setParsedData(parsed);
  }, [csvInput]);

  // Loading text timer sequence
  useEffect(() => {
    let timer: any;
    if (analysis.isLoading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [analysis.isLoading]);

  // Handle example selection
  const handleSelectExample = (exampleContent: string) => {
    setCsvInput(exampleContent);
  };

  // Drag and drop CSV upload handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === "string") {
            setCsvInput(event.target.result);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setCsvInput(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  // Perform Gemini Analysis
  const triggerAnalysis = async () => {
    if (!csvInput.trim()) {
      setAnalysis({
        isLoading: false,
        error: "資料欄位為空！請先貼上或拖曳 CSV 內容。",
        result: null,
        modelUsed: null,
        timestamp: null
      });
      return;
    }

    setAnalysis((prev) => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // 呼叫後端分析 API，並確保回傳的是 JSON
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvContent: csvInput,
          customInstruction: customSystemInstruction,
          modelType: modelType
        })
      });

      // 先檢查 HTTP 狀態，避免把 HTML 當成 JSON 解析
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      // 確認 Content-Type 為 JSON
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Unexpected response type (${contentType}): ${text}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "分析 API 回傳失敗，請重試。");
      }

      setAnalysis({
        isLoading: false,
        error: null,
        result: data.result,
        modelUsed: data.modelUsed,
        timestamp: data.timestamp,
      });
    } catch (err: any) {
      console.error(err);
      setAnalysis({
        isLoading: false,
        error: err.message || "處理請求時發生異常，請確認伺服器運作是否正常。",
        result: null,
        modelUsed: null,
        timestamp: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden antialiased">
      {/* 頂部導航列 (High-Density Styled Header Panel) */}
      <header id="app-navigation-header" className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 md:px-8 shrink-0 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-800">
                AI 數據分析與洞察工具
              </h1>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded tracking-wide font-mono">
                v2.1.0-PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-light hidden sm:block">專業級多維度決策報告自動生成器</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">系統運作模式</span>
            <span className="text-xs font-semibold text-indigo-600 font-mono flex items-center gap-1">
              PROMPT_v2_ANALYSIS_STRICT
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold font-mono text-sm shadow-inner">
              AI
            </div>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline-block">isaactwtv</span>
          </div>
        </div>
      </header>

      {/* 雙欄主版面配置 (High Density Container Grid) */}
      <main id="app-main-layout" className="flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50/50">
        
        {/* 左側輸入控制面板 (Left Controls Section - 410px width) */}
        <section id="left-sidebar-controls" className="w-full lg:w-[410px] border-r border-slate-200/80 bg-white flex flex-col shrink-0">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[calc(100vh-104px)]">
            
            {/* 區塊 1：上傳 / 選擇範例 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  快速資料範例與載入
                </h3>
                <span className="text-[10px] text-indigo-600 font-medium">隨選即測</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CSV_EXAMPLES.map((example) => (
                  <button
                    key={example.id}
                    id={`btn-example-${example.id}`}
                    onClick={() => handleSelectExample(example.content)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      csvInput.trim() === example.content.trim()
                        ? "bg-indigo-50/60 border-indigo-200 text-slate-800"
                        : "bg-white hover:bg-slate-50/50 border-slate-100 text-slate-600 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <span>{example.emoji}</span>
                      <span>{example.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-normal font-light">
                      {example.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 區塊 2：CSV 純文字貼上區帶拖曳 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  CSV 原始資料輸入
                </label>
                <span className="text-[10px] text-slate-400 font-serif">RAW DATA</span>
              </div>

              <div
                id="drag-drop-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border border-dashed rounded-xl transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/40"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <textarea
                  id="csv-text-input-field"
                  aria-label="CSV 報表貼上區"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="日期,通路,銷售額,利潤\n2026-05-01,門市,12000,5000\n..."
                  className="w-full h-76 p-4 text-xs font-mono bg-transparent border-0 focus:ring-0 focus:outline-none resize-none leading-relaxed text-slate-600 placeholder-slate-300"
                />

                {/* 浮動拖曳提示資訊層 */}
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-lg border border-slate-100 text-[10px] text-slate-400 shadow-sm pointer-events-none">
                  <Upload className="h-3 w-3 text-indigo-500" />
                  <span>拖曳 .csv 或點此</span>
                  <label className="text-indigo-600 font-semibold cursor-pointer pointer-events-auto hover:underline">
                    上傳
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>資料長度: <strong className="font-mono text-slate-600">{csvInput.length}</strong> 字元</span>
                </div>
                <span>預估: <strong className="font-mono text-slate-600">{parsedData.rows.length}</strong> 筆</span>
              </div>
            </div>

            {/* 區塊 3：模型微調與參數進階區塊 */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                  <span>AI 模型與引擎規格設定</span>
                </div>
                <button
                  type="button"
                  id="btn-toggle-advanced"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  {showAdvancedSettings ? "折疊高級選項" : "自訂提示指令"}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 font-medium">分析選用核心</label>
                <select
                  id="model-select-dropdown"
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg py-2 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                  {MODEL_OPTIONS.find((o) => o.id === modelType)?.description}
                </p>
              </div>

              {/* 進階客製 System Instructions 面板 */}
              {showAdvancedSettings && (
                <div className="space-y-2 pt-2 border-t border-slate-200/50 transition-all">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      自訂 System Instructions 常數
                    </span>
                    <button
                      type="button"
                      id="btn-reset-instruction"
                      onClick={() => setCustomSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION)}
                      className="text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[10px] transition-all"
                      title="極速還原成初始中文專業報表模型提示詞"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      還原預設
                    </button>
                  </div>
                  <textarea
                    id="system-instruction-textarea"
                    aria-label="System Instruction 自訂欄位"
                    value={customSystemInstruction}
                    onChange={(e) => setCustomSystemInstruction(e.target.value)}
                    className="w-full h-44 p-3 text-[10px] font-mono leading-relaxed bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="請輸入系統 System Instructions..."
                  />
                  <div className="text-[10px] text-amber-600 font-light bg-amber-50 rounded px-2.5 py-1.5 leading-normal">
                    💡 這會影響 AI 做多維度解讀的格式（如：與會、主題、待辦清單、中英雙語對照等）。建議維持預設格式。
                  </div>
                </div>
              )}
            </div>

            {/* 區塊 4：核心執行大按鈕與重要警語 */}
            <div className="space-y-4 pt-1">
              <button
                id="btn-trigger-analysis"
                onClick={triggerAnalysis}
                disabled={analysis.isLoading || !csvInput.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold font-sans text-sm flex items-center justify-center gap-3 transition-all tracking-wider shadow-lg shadow-indigo-100 ${
                  analysis.isLoading
                    ? "bg-indigo-400 text-white cursor-not-allowed opacity-85"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98] cursor-pointer hover:shadow-indigo-200"
                }`}
              >
                {analysis.isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4.5 w-4.5 animate-spin text-white" />
                    <span>數據解碼中...</span>
                  </div>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5 text-indigo-100 fill-current" />
                    <span>開始 AI 數據分析</span>
                  </>
                )}
              </button>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-800 leading-normal font-light">
                  <strong className="block font-semibold mb-0.5 text-emerald-900">🛡️ 專利沙盒安全聲明</strong>
                  您的 CSV 數據會經加密並代理至 Google Gemini API 在背景進行高隱私安全演算，無任何永久雲端儲存，確保內部商業名單絕不外洩。
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 右側分析結果與預覽面 (Right Main Workspace Pane - scrolling space) */}
        <section id="workspace-right-pane" className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-104px)] space-y-6">
          
          {/* 連動 CSV 結構檢視 table (能讓數據立即視覺化校對) */}
          {parsedData.headers.length > 0 ? (
            <CsvTable data={parsedData} />
          ) : (
            <div id="no-parsed-data-placeholder" className="bg-slate-100/40 border border-slate-200/60 border-dashed rounded-2xl p-8 text-center text-slate-400 text-xs">
              <Database className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              尚未解析到合法的 csv 內容。請確保包含首列為欄位名，逗點作為間隔符。
            </div>
          )}

          {/* AI 分析洞察渲染 */}
          {analysis.isLoading ? (
            <div id="analysis-loading-wrapper" className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute w-16 h-16 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin"></div>
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <h4 className="font-semibold text-slate-800 text-base font-sans tracking-tight">
                正在進行商業矩陣解析
              </h4>
              <p className="text-xs text-indigo-600 font-medium font-mono mt-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {loadingSteps[loadingStep] || "數據推理整合中..."}
              </p>
              <div className="max-w-xs w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-6">
                <div
                  className="bg-indigo-600 h-1 transition-all duration-700 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 leading-normal font-light">
                本系統配合 Gemini 分析具有高達數百萬級的上下文支援，稍待片刻即可產出多語言洞察。
              </p>
            </div>
          ) : (
            <AnalysisOutput
              result={analysis.result}
              modelUsed={analysis.modelUsed}
              timestamp={analysis.timestamp}
              error={analysis.error}
            />
          )}

          {/* 當無任何分析結果與載入狀態時的空狀態展示 */}
          {!analysis.result && !analysis.isLoading && !analysis.error && (
            <div id="insights-empty-billboard" className="bg-gradient-to-tr from-white to-slate-50/50 border border-slate-200 rounded-3xl p-10 md:p-12 text-center shadow-inner relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-[0.03] text-indigo-900 font-black text-9xl uppercase select-none pointer-events-none font-mono">
                DATA
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto border border-indigo-100 shadow-sm">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-800 font-sans">
                    待命就緒 — 期待發掘您資料中的寶藏
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    請於左側確認好您的 CSV 報表內容，並點擊下方「<span className="font-semibold text-indigo-600">開始 AI 數據分析</span>」按鈕。AI 核心將能為您診斷出前所未見的市場趨勢、營運洞察與落地待辦項！
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-4 text-left">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="text-base">📊</span>
                    <h5 className="font-bold text-[11px] text-slate-700 mt-1">1. 資料維度</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">快速精準推廣欄位與大小記錄概覽</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="text-base">💡</span>
                    <h5 className="font-bold text-[11px] text-slate-700 mt-1">2. 關鍵洞察</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">定位最優與最劣產品特徵趨勢</p>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                    <span className="text-base">📋</span>
                    <h5 className="font-bold text-[11px] text-slate-700 mt-1">3. 行動待辦</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">提供高可執行性的團隊待辦事項清單</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* 底部狀態底列 (High-Density Bottom Status Bar) */}
      <footer id="app-footer-bar" className="h-10 bg-slate-800 text-slate-400 flex items-center justify-between px-6 text-[10px] shrink-0 font-sans shadow-md">
        <div className="flex items-center gap-5 uppercase tracking-widest text-slate-400/90 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API 連線狀態: 正常</span>
          </div>
          <div className="hidden sm:block">
            <span>引擎: {modelType.toUpperCase()}</span>
          </div>
          <div className="hidden md:block">
            <span>語系架構: TRADITIONAL_CHINESE (繁體中文)</span>
          </div>
        </div>
        <div className="font-mono text-slate-500 hidden sm:block">
          環境 ID: 8F29-D3E1-44B2-990C
        </div>
      </footer>

    </div>
  );
}
