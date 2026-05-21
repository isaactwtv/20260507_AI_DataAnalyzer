import { ParsedCsv } from "../types";

/**
 * Robust CSV parser that handles quoted cells (which can contain commas)
 */
export function parseCsvText(text: string): ParsedCsv {
  const result: ParsedCsv = {
    headers: [],
    rows: [],
    rawText: text,
  };

  if (!text || text.trim() === "") {
    return result;
  }

  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  // Split lines accounting for quotes that might contain line breaks
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++; // skip next \n
      }
      lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim() !== "" || text.endsWith("\n") || text.endsWith("\r")) {
    lines.push(currentLine);
  }

  // Parse fields on each line
  const parsedLines: string[][] = lines
    .map((line) => {
      const fields: string[] = [];
      let currentField = "";
      let quoteCount = 0;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          quoteCount++;
        } else if (char === "," && quoteCount % 2 === 0) {
          // Found unquoted comma
          fields.push(cleanField(currentField));
          currentField = "";
          quoteCount = 0;
        } else {
          currentField += char;
        }
      }
      fields.push(cleanField(currentField));
      return fields;
    })
    .filter((row) => row.length > 0 && row.some((field) => field.trim() !== ""));

  if (parsedLines.length > 0) {
    result.headers = parsedLines[0];
    result.rows = parsedLines.slice(1);
  }

  return result;
}

function cleanField(field: string): string {
  let cleaned = field.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  // Replace escaped double quotes "" with a single "
  return cleaned.replace(/""/g, '"');
}
