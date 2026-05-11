import { NextRequest, NextResponse } from "next/server";
import { queries } from "@/lib/db";
import { z } from "zod";



export async function GET() {
  const projects = await queries.listProjects();
  return NextResponse.json({ projects });
}

const CreateProject = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateProject.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const project = await queries.createProject(parsed.data.name, parsed.data.description);
  return NextResponse.json({ project }, { status: 201 });
}
