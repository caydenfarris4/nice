import Papa from "papaparse";
import { extractText, getDocumentProxy } from "unpdf";

export type ParsedFile = {
  filename: string;
  mimeType: string;
  size: number;
  content: string;
};

export async function parseFile(file: File): Promise<ParsedFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const name = file.name;
  const lower = name.toLowerCase();
  const mime = file.type || guessMime(lower);
  const size = buffer.byteLength;

  let content = "";
  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    content = (Array.isArray(text) ? text.join("\n\n") : text).trim();
  } else if (lower.endsWith(".csv") || mime === "text/csv") {
    const text = new TextDecoder().decode(buffer);
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    const rows = parsed.data as Record<string, unknown>[];
    const fields = parsed.meta.fields ?? [];
    content = formatCsv(name, fields, rows);
  } else {
    content = new TextDecoder().decode(buffer);
  }

  if (!content.trim()) {
    throw new Error(`No text extracted from ${name}`);
  }

  return { filename: name, mimeType: mime, size, content };
}

function guessMime(lower: string): string {
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

function formatCsv(name: string, fields: string[], rows: Record<string, unknown>[]): string {
  const preview = rows.slice(0, 200);
  const header = `# ${name}\n# columns: ${fields.join(", ")}\n# rows: ${rows.length}\n\n`;
  const tableHeader = `| ${fields.join(" | ")} |\n| ${fields.map(() => "---").join(" | ")} |\n`;
  const tableBody = preview
    .map((r) => `| ${fields.map((f) => String(r[f] ?? "")).join(" | ")} |`)
    .join("\n");
  const truncated =
    rows.length > preview.length ? `\n\n(${rows.length - preview.length} more rows truncated)` : "";
  return header + tableHeader + tableBody + truncated;
}
