import React, { useState } from "react";
import { ParsedCsv } from "../types";
import { Table, Eye, Hash, Grid, ChevronRight, ChevronLeft } from "lucide-react";

interface CsvTableProps {
  data: ParsedCsv;
}

export const CsvTable: React.FC<CsvTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  if (!data || data.headers.length === 0) {
    return null;
  }

  const { headers, rows } = data;
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const currentRows = rows.slice(startIndex, endIndex);

  return (
    <div id="csv-preview-container" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden transition-all hover:border-slate-300">
      <div id="csv-preview-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Table className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-800 tracking-tight">
              解析後資料預覽
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">預先校對欄位資訊與記錄形態</p>
          </div>
        </div>

        <div id="csv-meta-stats" className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <Grid className="h-3.5 w-3.5 text-slate-400" />
            <span>{headers.length} 欄</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <Hash className="h-3.5 w-3.5 text-slate-400" />
            <span>{totalRows} 筆記錄</span>
          </div>
        </div>
      </div>

      <div id="csv-table-wrapper" className="relative border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-4 text-xs font-mono font-medium text-slate-400 w-12 text-center">
                  #
                </th>
                {headers.map((header, idx) => (
                  <th
                    key={`th-${idx}`}
                    className="py-3 px-4 text-xs font-medium text-slate-600 tracking-tight whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60 bg-white">
              {currentRows.map((row, rIdx) => {
                const globalRowNumber = startIndex + rIdx + 1;
                return (
                  <tr
                    key={`row-${rIdx}`}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-xs font-mono text-slate-400 text-center bg-slate-50/30 group-hover:bg-slate-50">
                      {globalRowNumber}
                    </td>
                    {headers.map((_, cIdx) => (
                      <td
                        key={`cell-${rIdx}-${cIdx}`}
                        className="py-2.5 px-4 text-sm text-slate-600 whitespace-nowrap overflow-hidden max-w-xs truncate"
                        title={row[cIdx] || ""}
                      >
                        {row[cIdx] !== undefined && row[cIdx] !== "" ? (
                          row[cIdx]
                        ) : (
                          <span className="text-slate-300 italic font-mono text-xs">null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalRows === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            沒有有效的資料列。
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div id="csv-table-pagination" className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            顯示第 <span className="font-semibold text-slate-600">{startIndex + 1}</span> 至{" "}
            <span className="font-semibold text-slate-600">{endIndex}</span> 筆記錄項目 (共計{" "}
            <span className="font-semibold text-slate-600">{totalRows}</span> 筆)
          </div>
          <div className="flex items-center gap-1">
            <button
              id="csv-btn-prev"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border transition-all ${
                currentPage === 1
                  ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              }`}
              title="上一頁"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500 px-2">
              {currentPage} / {totalPages} 頁
            </span>
            <button
              id="csv-btn-next"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              }`}
              title="下一頁"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
