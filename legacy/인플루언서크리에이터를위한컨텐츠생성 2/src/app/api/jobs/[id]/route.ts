import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { refreshVideo } from "@/lib/higgsfield";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const v = db.videos.get(id);
  if (!v) {
    return NextResponse.json({ error: "작업을 찾을 수 없어요." }, { status: 404 });
  }
  try {
    await refreshVideo(v);
  } catch {
    // 다음 폴링에서 재시도
  }
  return NextResponse.json({ video: v });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  db.videos.delete(id);
  return NextResponse.json({ ok: true });
}
