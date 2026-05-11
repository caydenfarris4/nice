import { NextResponse } from "next/server";
import { queries } from "@/lib/db";



export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  const { id, sourceId } = await params;
  await queries.deleteSource(Number(sourceId), Number(id));
  return NextResponse.json({ ok: true });
}
