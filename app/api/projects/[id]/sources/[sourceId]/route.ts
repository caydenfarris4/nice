import { NextResponse } from "next/server";
import { queries } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id, sourceId } = await params;
  queries.deleteSource.run(Number(sourceId), Number(id));
  return NextResponse.json({ ok: true });
}
