import { NextRequest, NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { parseFile } from "@/lib/parsers";



export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sources = await queries.listSources(Number(id));
  return NextResponse.json({ sources });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!(await queries.getProject(projectId))) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  const form = await req.formData();
  const files = form.getAll("file").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "no files" }, { status: 400 });
  }
  const created: unknown[] = [];
  const errors: { filename: string; message: string }[] = [];
  for (const file of files) {
    try {
      const parsed = await parseFile(file);
      const id = await queries.insertSource(
        projectId,
        parsed.filename,
        parsed.mimeType,
        parsed.size,
        parsed.content
      );
      created.push({ id, filename: parsed.filename });
    } catch (e) {
      errors.push({ filename: file.name, message: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json(
    { created, errors },
    { status: errors.length && !created.length ? 400 : 201 }
  );
}
