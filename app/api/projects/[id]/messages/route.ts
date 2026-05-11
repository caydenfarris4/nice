import { NextRequest, NextResponse } from "next/server";
import { queries, type Message, type Source } from "@/lib/db";
import { runChat } from "@/lib/pipeline";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = queries.listMessages.all(Number(id));
  return NextResponse.json({ messages });
}

const PostBody = z.object({ question: z.string().min(1).max(8000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!queries.getProject.get(projectId)) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }
  const body = await req.json();
  const parsed = PostBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const question = parsed.data.question;

  const sources = (queries.getSourcesFull.all(projectId) as Source[]).map((s) => ({
    filename: s.filename,
    content: s.content,
  }));
  const history = (queries.listMessages.all(projectId) as Message[]).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const { answer, brief } = await runChat({ question, sources, history });
    queries.insertMessage.run(projectId, "user", question, null);
    queries.insertMessage.run(projectId, "assistant", answer, JSON.stringify(brief));
    return NextResponse.json({ answer, brief });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
