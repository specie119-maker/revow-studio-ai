import { NextRequest, NextResponse } from "next/server";
import { db, newId } from "@/lib/store";
import { startVideoGeneration } from "@/lib/higgsfield";
import { resolveEngine, resolveImageModel } from "@/lib/models";
import type { Character, GenMode, VideoJob } from "@/lib/types";

export const dynamic = "force-dynamic";

const ASPECTS = ["9:16", "1:1", "16:9"] as const;
const MODES = ["face", "text", "image"] as const;

export async function POST(req: NextRequest) {
  let body: {
    mode?: string;
    characterId?: string;
    inputImage?: string;
    prompt?: string;
    preset?: string;
    aspectRatio?: string;
    engine?: string;
    imageModel?: string;
    identityFocus?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const mode: GenMode = (MODES as readonly string[]).includes(body.mode ?? "")
    ? (body.mode as GenMode)
    : "face";

  // 모드별 입력 검증
  let character: Character | undefined;
  let sourceLabel = "텍스트";
  if (mode === "face") {
    character = body.characterId ? db.characters.get(body.characterId) : undefined;
    // 메모리에 없어도 char_p_<providerId>면 학습된 얼굴이므로 즉시 복원
    if (!character && body.characterId?.startsWith("char_p_")) {
      const providerId = body.characterId.slice("char_p_".length);
      character = {
        id: body.characterId,
        name: "캐릭터",
        status: "succeeded",
        progress: 100,
        refThumbs: [],
        providerId,
        createdAt: Date.now(),
      };
      db.characters.set(character.id, character);
    }
    if (!character) {
      return NextResponse.json(
        { error: "먼저 얼굴(캐릭터)을 선택/학습해 주세요." },
        { status: 400 },
      );
    }
    if (character.status !== "succeeded") {
      return NextResponse.json(
        { error: "캐릭터 학습이 끝난 뒤에 영상을 생성할 수 있어요." },
        { status: 409 },
      );
    }
    sourceLabel = character.name;
  } else if (mode === "image") {
    if (!body.inputImage || !body.inputImage.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "영상으로 만들 사진을 올려 주세요." },
        { status: 400 },
      );
    }
    sourceLabel = "내 사진";
  }

  const prompt = (body.prompt ?? "").trim();
  if (mode !== "image" && prompt.length < 3) {
    return NextResponse.json(
      { error: "어떤 영상을 만들지 설명을 입력해 주세요." },
      { status: 400 },
    );
  }

  const aspectRatio = (ASPECTS as readonly string[]).includes(
    body.aspectRatio ?? "",
  )
    ? (body.aspectRatio as VideoJob["aspectRatio"])
    : "9:16";

  // 모델은 레지스트리로 검증(없으면 기본값으로 폴백)
  const engine = resolveEngine(body.engine).id;
  const imageModel = resolveImageModel(body.imageModel).id;

  const video: VideoJob = {
    id: newId("vid"),
    mode,
    characterId: character?.id,
    sourceLabel,
    prompt: (prompt || "subtle natural motion").slice(0, 500),
    preset: (body.preset || "cinematic").slice(0, 40),
    aspectRatio,
    engine,
    imageModel,
    identityFocus: body.identityFocus !== false, // 기본 ON (닮음 우선)
    status: "queued",
    progress: 0,
    createdAt: Date.now(),
  };

  try {
    await startVideoGeneration(video, {
      character,
      inputImageDataUrl: mode === "image" ? body.inputImage : undefined,
    });
  } catch (e) {
    video.status = "failed";
    video.error = e instanceof Error ? e.message : "생성 시작 실패";
  }

  db.videos.set(video.id, video);
  return NextResponse.json({ video }, { status: 201 });
}

// 갤러리용 목록
export async function GET() {
  const list = [...db.videos.values()].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  return NextResponse.json({ videos: list });
}
