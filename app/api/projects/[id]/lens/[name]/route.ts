import { NextRequest, NextResponse } from "next/server";
import { queries, type Analysis, type Source } from "@/lib/db";
import { runLens } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 180;

const VALID = new Set(["roi", "roadmap", "psych"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; name: string }> }
) {
  const { id, name } = await params;
  if (!VALID.has(name)) return NextResponse.json({ error: "unknown lens" }, { status: 400 });
  const row = queries.getAnalysis.get(Number(id), name) as Analysis | undefined;
  if (!row) return NextResponse.json({ analysis: null });
  return NextResponse.json({
    analysis: { id: row.id, lens: row.lens, payload: JSON.parse(row.payload), created_at: row.created_at },
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; name: string }> }
) {
  const { id, name } = await params;
  const projectId = Number(id);
  if (!VALID.has(name)) return NextResponse.json({ error: "unknown lens" }, { status: 400 });
  if (!queries.getProject.get(projectId)) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  const sources = (queries.getSourcesFull.all(projectId) as Source[]).map((s) => ({
    filename: s.filename,
    content: s.content,
  }));
  if (sources.length === 0) {
    return NextResponse.json({ error: "add sources to the project first" }, { status: 400 });
  }
  try {
    const payload = await runLens({ lens: name as "roi" | "roadmap" | "psych", sources });
    queries.insertAnalysis.run(projectId, name, JSON.stringify(payload));
    return NextResponse.json({ payload });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
