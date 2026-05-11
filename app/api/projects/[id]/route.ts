import { NextResponse } from "next/server";
import { queries } from "@/lib/db";



export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await queries.getProject(Number(id));
  if (!project) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await queries.deleteProject(Number(id));
  return NextResponse.json({ ok: true });
}
