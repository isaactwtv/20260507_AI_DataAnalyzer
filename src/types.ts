/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
  rawText: string;
}

export interface CsvExample {
  id: string;
  title: string;
  description: string;
  emoji: string;
  content: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  modelUsed: string | null;
  timestamp: string | null;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isPremium?: boolean;
}
