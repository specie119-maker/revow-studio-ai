import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { refreshCharacter } from "@/lib/higgsfield";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const c = db.characters.get(id);
  if (!c) {
    return NextResponse.json({ error: "캐릭터를 찾을 수 없어요." }, { status: 404 });
  }
  try {
    await refreshCharacter(c);
  } catch {
    // 폴링 실패는 다음 폴링에서 재시도
  }
  return NextResponse.json({ character: c });
}
