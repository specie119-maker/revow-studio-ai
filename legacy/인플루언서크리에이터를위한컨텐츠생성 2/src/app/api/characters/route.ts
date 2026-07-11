import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/store";
import { startCharacterTraining, listProviderFaces } from "@/lib/higgsfield";
import { resolveTrainModel } from "@/lib/models";
import type { Character } from "@/lib/types";

export const dynamic = "force-dynamic";

// 목록(최신순). Higgsfield에 영구 저장된 학습 얼굴을 병합해, 서버를
// 재시작해도 이전에 학습한 얼굴이 계속 보이도록 한다.
export async function GET() {
  try {
    const faces = await listProviderFaces();
    // 세션 메모리에 이미 있는 providerId는 그대로 두고, 없는 것만 보관함에서 추가
    const known = new Set(
      [...db.characters.values()].map((c) => c.providerId).filter(Boolean),
    );
    for (const f of faces) {
      if (known.has(f.providerId)) continue;
      if (f.status === "failed") continue; // 실패한 학습은 숨김
      const id = `char_p_${f.providerId}`;
      const status =
        f.status === "completed"
          ? "succeeded"
          : f.status === "failed"
            ? "failed"
            : "processing";
      const existing = db.characters.get(id);
      const merged: Character = {
        id,
        name: f.name,
        status,
        progress: status === "succeeded" ? 100 : 90,
        refThumbs: existing?.refThumbs ?? [],
        previewUrl: f.thumbnailUrl ?? existing?.previewUrl,
        providerId: f.providerId,
        modelVersion: f.modelVersion ?? existing?.modelVersion,
        createdAt: f.createdAt || existing?.createdAt || Date.now(),
      };
      db.characters.set(id, merged);
    }
  } catch {
    // 보관함 조회 실패해도 세션 캐릭터는 그대로 반환
  }

  const list = [...db.characters.values()].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  return NextResponse.json({ characters: list });
}

// 새 얼굴 학습 시작
export async function POST(req: NextRequest) {
  let body: { name?: string; images?: string[]; modelVersion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const images = (body.images ?? []).filter(
    (s) => typeof s === "string" && s.length > 0,
  );
  if (images.length < 1) {
    return NextResponse.json(
      { error: "참조 사진을 최소 1장 이상 업로드하세요." },
      { status: 400 },
    );
  }
  if (images.length > 8) {
    return NextResponse.json(
      { error: "참조 사진은 최대 8장까지 업로드할 수 있어요." },
      { status: 400 },
    );
  }

  const character: Character = {
    id: newId("char"),
    name: (body.name?.trim() || "내 캐릭터").slice(0, 40),
    status: "queued",
    progress: 0,
    refThumbs: images,
    modelVersion: resolveTrainModel(body.modelVersion),
    createdAt: Date.now(),
  };

  try {
    await startCharacterTraining(character);
  } catch (e) {
    character.status = "failed";
    character.error = e instanceof Error ? e.message : "학습 시작 실패";
  }

  db.characters.set(character.id, character);
  return NextResponse.json({ character }, { status: 201 });
}
