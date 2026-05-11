import Papa from "papaparse";

export type ParsedFile = {
  filename: string;
  mimeType: string;
  size: number;
  content: string;
};

export async function parseFile(file: File): Promise<ParsedFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name;
  const lower = name.toLowerCase();
  const mime = file.type || guessMime(lower);
  const size = buffer.byteLength;

  let content = "";
  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const out = await pdfParse(buffer);
    content = out.text.trim();
  } else if (lower.endsWith(".csv") || mime === "text/csv") {
    const text = buffer.toString("utf8");
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    const rows = parsed.data as Record<string, unknown>[];
    const fields = parsed.meta.fields ?? [];
    content = formatCsv(name, fields, rows);
  } else {
    content = buffer.toString("utf8");
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
  const truncated = rows.length > preview.length ? `\n\n(${rows.length - preview.length} more rows truncated)` : "";
  return header + tableHeader + tableBody + truncated;
}
