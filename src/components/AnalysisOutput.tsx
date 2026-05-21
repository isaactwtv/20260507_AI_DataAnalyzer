import React, { useState } from "react";
import { Sparkles, Copy, Check, Download, AlertCircle, FileText } from "lucide-react";

interface AnalysisOutputProps {
  result: string | null;
  modelUsed: string | null;
  timestamp: string | null;
  error: string | null;
}

export const AnalysisOutput: React.FC<AnalysisOutputProps> = ({
  result,
  modelUsed,
  timestamp,
  error
}) => {
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div id="analysis-error-card" className="bg-red-50/50 border border-red-200 rounded-2xl p-6 text-red-800 transition-all">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 font-sans">分析過程中發生錯誤</h4>
            <p className="text-sm mt-1 text-red-700/90 leading-relaxed">{error}</p>
            <div className="mt-4 bg-white/60 p-3 rounded-lg border border-red-100 text-xs font-mono text-slate-500">
              請檢查您的 Gemini API 金鑰配置，或確認上傳的數據格式是否正確，隨後重新嘗試。
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AI_Data_Insight_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Safe & high-fidelity lighter markdown parser mapping block tokens to stylish JSX.
   */
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${key++}`} className="list-disc pl-6 mb-5 space-y-1.5 text-slate-700">
            {listItems.map((item, index) => (
              <li key={`li-${index}`} className="text-sm leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        // filter out separator lines (e.g. |---|---|)
        const activeRows = tableRows.filter(
          (row) => !row.every((cell) => cell.trim().match(/^:?-+:?$/))
        );

        if (activeRows.length > 0) {
          const isHeaderRow = (rIdx: number) => rIdx === 0;

          elements.push(
            <div key={`table-container-${key++}`} className="overflow-x-auto my-5 border border-slate-200 rounded-xl bg-slate-50 shadow-sm max-w-full">
              <table className="min-w-full border-collapse text-left">
                <tbody>
                  {activeRows.map((row, rIdx) => (
                    <tr
                      key={`tr-${rIdx}`}
                      className={
                        isHeaderRow(rIdx)
                          ? "bg-slate-100/80 border-b border-slate-200 text-slate-800 font-semibold text-xs uppercase"
                          : "border-b border-slate-100 bg-white last:border-b-0 hover:bg-slate-50/50"
                      }
                    >
                      {row.map((cell, cIdx) => {
                        const cellContent = cell.trim();
                        if (isHeaderRow(rIdx)) {
                          return (
                            <th
                              key={`th-${cIdx}`}
                              className="py-3 px-4 text-xs font-semibold text-slate-700 tracking-tight"
                            >
                              {parseInlineFormatting(cellContent)}
                            </th>
                          );
                        } else {
                          return (
                            <td
                              key={`td-${cIdx}`}
                              className="py-2.5 px-4 text-sm text-slate-600"
                            >
                              {parseInlineFormatting(cellContent)}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        tableRows = [];
        inTable = false;
      }
    };

    // Helper to process inline styles like bold **, italics *, and inline code `
    function parseInlineFormatting(str: string): React.ReactNode {
      // Split by double asterisks first ** for bold styling
      const boldParts = str.split(/\*\*([^*]+)\*\*/g);
      if (boldParts.length > 1) {
        return (
          <>
            {boldParts.map((part, index) => {
              // Odd indices are bold items
              if (index % 2 !== 0) {
                return (
                  <strong key={`b-${index}`} className="font-semibold text-slate-900 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                    {part}
                  </strong>
                );
              }
              // Even indices are default text, check for inline code or italics inside
              return parseDeepInline(part);
            })}
          </>
        );
      }
      return parseDeepInline(str);
    }

    function parseDeepInline(str: string): React.ReactNode {
      // Inline backticks `code`
      const codeParts = str.split(/`([^`]+)`/g);
      if (codeParts.length > 1) {
        return (
          <>
            {codeParts.map((part, index) => {
              if (index % 2 !== 0) {
                return (
                  <code key={`code-${index}`} className="font-mono text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    {part}
                  </code>
                );
              }
              return part;
            })}
          </>
        );
      }
      return str;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Table Row matcher helper
      const isTablePipeLine = trimmed.startsWith("|") && trimmed.endsWith("|");

      // Handle table boundary
      if (isTablePipeLine) {
        flushList();
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        // split row and remove empty ends
        const cells = line.split("|").slice(1, -1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // List Item matcher helper
      const isListItem = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");
      if (isListItem) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        // Extract rest of the text
        const itemText = trimmed.replace(/^[-*•]\s+/, "");
        listItems.push(itemText);
        continue;
      } else if (inList) {
        flushList();
      }

      // Headers handling
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${key++}`} className="text-2xl font-bold text-slate-900 mt-6 mb-3 font-sans border-b border-slate-100 pb-2">
            {parseInlineFormatting(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${key++}`} className="text-xl font-bold text-slate-800 mt-5 mb-2.5 font-sans flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-500 rounded-full inline-block"></span>
            {parseInlineFormatting(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${key++}`} className="text-lg font-semibold text-slate-700 mt-4 mb-2 font-sans">
            {parseInlineFormatting(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={`quote-${key++}`} className="border-l-4 border-indigo-400 pl-4 py-1 italic text-slate-600 bg-slate-50/75 rounded-r-lg my-4 text-sm leading-relaxed">
            {parseInlineFormatting(trimmed.substring(2))}
          </blockquote>
        );
      } else if (trimmed === "") {
        // Just empty spacing
        continue;
      } else {
        // Plain Paragraph
        elements.push(
          <p key={`p-${key++}`} className="text-slate-600 text-sm leading-relaxed mb-4">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    // Flush any remaining active blocks
    flushList();
    flushTable();

    return elements;
  };

  return (
    <div id="analysis-output-container" className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm hover:border-slate-300 transition-all">
      <div id="output-meta-row" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-xl">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-semibold text-slate-800 text-base">
                AI 智慧大數據報告
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-600 font-medium font-mono">
                {modelUsed}
              </span>
            </div>
            {timestamp && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                產出時間：{new Date(timestamp).toLocaleString("zh-TW", { hour12: false })}
              </p>
            )}
          </div>
        </div>

        <div id="action-buttons-group" className="flex items-center gap-2">
          <button
            id="btn-copy-report"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
              copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95"
            }`}
            title="複製完整的 Markdown 報告"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "已複製！" : "一鍵複製"}
          </button>

          <button
            id="btn-download-report"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95"
            title="下載為 Markdown 檔案"
          >
            <Download className="h-3.5 w-3.5" />
            下載報表 (.md)
          </button>
        </div>
      </div>

      <div id="rendered-insight-box" className="prose prose-slate max-w-none text-slate-800">
        {renderMarkdown(result)}
      </div>

      <div id="analysis-disclaimer" className="mt-8 pt-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-300">
          * AI 數據分析報告僅供商業決策與科學研究輔助參考。為確保重要商業行為的安全無誤，請與實際數據核對。
        </p>
      </div>
    </div>
  );
};
