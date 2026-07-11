// ─────────────────────────────────────────────────────────────────────────────
// Higgsfield 연동 레이어  (공식 SDK: @higgsfield/client)
//
// 두 가지 모드로 동작합니다.
//
//  1) 실연동 모드 — HF_CREDENTIALS(="키ID:시크릿") 또는 HF_API_KEY+HF_API_SECRET
//                   가 설정된 경우. 실제 Higgsfield 호출.
//
//  2) 데모 모드   — 자격증명이 없을 때 자동 활성화. 실제 호출 없이 시간 경과 기반으로
//                   진행률을 시뮬레이션하고 샘플 결과를 돌려줍니다.
//
// ── 실연동 파이프라인 ────────────────────────────────────────────────────────
//   얼굴 학습 :  uploadImage(사진들) → createSoulId({input_images}) ⇒ Soul ID
//   영상 생성 :  Soul 텍스트→이미지(custom_reference_id = Soul ID) ⇒ 장면 이미지
//                → DoP 이미지→영상(input_images=[장면 이미지]) ⇒ 최종 영상
//
// ⚠️ 자격증명이 없으면(=크레딧/키 발급 전) 실연동은 호출되지 않습니다. 키 발급 후
//    소액 크레딧만 있으면 바로 동작합니다. 모델/필드명이 플랜에 따라 다르면 아래
//    SOUL_MODEL / DOP_MODEL 상수와 input 구성만 조정하면 됩니다.
// ─────────────────────────────────────────────────────────────────────────────

import type { Character, VideoJob } from "./types";
import { resolveEngine, resolveImageModel } from "./models";

// ── 자격증명 파싱 ────────────────────────────────────────────────────────────
function readCredentials(): { apiKey: string; apiSecret: string } | null {
  const combo = process.env.HF_CREDENTIALS?.trim();
  if (combo && combo.includes(":")) {
    const [apiKey, apiSecret] = combo.split(":");
    if (apiKey && apiSecret) return { apiKey, apiSecret };
  }
  const apiKey = process.env.HF_API_KEY?.trim();
  const apiSecret = process.env.HF_API_SECRET?.trim();
  if (apiKey && apiSecret) return { apiKey, apiSecret };
  return null;
}

export function isDemoMode(): boolean {
  const forced = process.env.DEMO_MODE?.trim().toLowerCase();
  if (forced === "true") return true;
  if (forced === "false") return false;
  return !readCredentials();
}

// ── 사용할 모델 (필요 시 여기만 교체) ────────────────────────────────────────
const PLATFORM_BASE = "https://platform.higgsfield.ai";
// 닮음 우선 모드: 얼굴이 또렷하게 보이도록 프레이밍을 강제
const IDENTITY_PREFIX =
  "close-up portrait, frontal view facing the camera, sharp clear recognizable face, soft natural lighting, minimal head movement, ";

// 비율 → Soul 지원 해상도 매핑
const SIZE_BY_ASPECT: Record<VideoJob["aspectRatio"], string> = {
  "9:16": "1152x2048",
  "1:1": "1536x1536",
  "16:9": "2048x1152",
};

// ── SDK 클라이언트(지연 로딩·캐싱) ───────────────────────────────────────────
type V1Client = {
  uploadImage: (buf: Buffer, fmt?: "jpeg" | "png" | "webp") => Promise<string>;
  createSoulId: (
    data: { name: string; input_images: { type: string; image_url: string }[] },
    withPolling?: boolean,
  ) => Promise<{ id: string; status: string; isCompleted: boolean; isFailed: boolean }>;
  listSoulIds: (
    page?: number,
    pageSize?: number,
  ) => Promise<{ items: { id: string; name: string; status: string }[] }>;
};
type V2Client = {
  subscribe: (
    endpoint: string,
    options: { input: Record<string, unknown>; withPolling?: boolean },
  ) => Promise<{
    status: string;
    images?: { url: string }[];
    video?: { url: string };
  }>;
};

let _v1: V1Client | null = null;
let _v2: V2Client | null = null;

// 학습/생성은 수 분 걸릴 수 있으므로 폴링 한도를 넉넉히 (기본값 5분으로는 부족)
const POLL_CFG = { maxPollTime: 900000, pollInterval: 4000, timeout: 60000 };

async function clients(): Promise<{ v1: V1Client; v2: V2Client; InputImage: { fromUrl: (u: string) => { type: string; image_url: string } } }> {
  const creds = readCredentials();
  if (!creds) throw new Error("Higgsfield 자격증명이 없습니다.");
  const v1mod = await import("@higgsfield/client");
  const v2mod = await import("@higgsfield/client/v2");
  if (!_v1)
    _v1 = new v1mod.HiggsfieldClient({
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      ...POLL_CFG,
    }) as unknown as V1Client;
  if (!_v2)
    _v2 = v2mod.createHiggsfieldClient({
      credentials: `${creds.apiKey}:${creds.apiSecret}`,
      ...POLL_CFG,
    }) as unknown as V2Client;
  return { v1: _v1, v2: _v2, InputImage: v1mod.InputImage };
}

// 캐릭터별 원격 상태 폴링 쓰로틀 (프론트가 1.5초마다 조회해도 API는 드물게 호출)
const remotePollAt = new Map<string, number>();

function dataUrlToBuffer(dataUrl: string): { buf: Buffer; fmt: "jpeg" | "png" | "webp" } {
  const m = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error("이미지 형식을 인식할 수 없어요.");
  const fmt = (m[1] === "png" ? "png" : m[1] === "webp" ? "webp" : "jpeg") as
    | "jpeg"
    | "png"
    | "webp";
  return { buf: Buffer.from(m[2], "base64"), fmt };
}

/** 백그라운드 작업(요청 응답을 막지 않음). 저장소의 객체를 참조로 갱신. */
function runBg(label: string, fn: () => Promise<void>) {
  fn().catch((e) => {
    console.error(`[higgsfield:${label}]`, e);
  });
}

// ── 데모용 자원 ──────────────────────────────────────────────────────────────
const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
];
function hashToInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function demoImage(seed: string, w = 600, h = 800): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
function timeProgress(createdAt: number, durationMs: number, cap = 100): number {
  const elapsed = Date.now() - createdAt;
  const p = Math.min(cap, Math.round((elapsed / durationMs) * 100));
  return Math.max(2, p);
}
const TRAIN_MS = 9000; // 데모 학습 ~9초
const GEN_MS = 12000; // 데모 생성 ~12초
const REAL_TRAIN_EST = 420000; // 실연동 학습 진행률 추정(~7분, v2는 더 오래 걸림)
const REAL_GEN_EST = 90000; // 실연동 생성 진행률 추정(~1.5분)

// ─────────────────────────────────────────────────────────────────────────────
// 얼굴(Soul ID) 학습
// ─────────────────────────────────────────────────────────────────────────────

export async function startCharacterTraining(c: Character): Promise<void> {
  if (isDemoMode()) {
    c.status = "processing";
    c.progress = 2;
    return;
  }

  // ── 실연동 ──
  // 비차단 방식: 업로드 + Soul ID 생성요청만 하고, 학습 완료 여부는
  // refreshCharacter에서 실제 상태를 직접 조회한다. (블로킹 폴링 타임아웃으로
  // 인한 "조용한 멈춤" 방지)
  c.status = "processing";
  c.progress = 3;
  runBg("train", async () => {
    try {
      const { v1 } = await clients();
      const creds = readCredentials()!;
      // 1) 참조 사진 업로드 → CDN URL
      const urls: string[] = [];
      for (const dataUrl of c.refThumbs) {
        const { buf, fmt } = dataUrlToBuffer(dataUrl);
        urls.push(await v1.uploadImage(buf, fmt));
      }
      c.baseImageUrl = urls[0];
      c.previewUrl = urls[0];
      // 2) Soul ID 학습 시작 — 선택한 model_version으로 (SDK는 v1 고정이라 raw 호출)
      const soul = await createSoulIdRaw(
        creds,
        c.name,
        urls,
        c.modelVersion ?? "v2",
      );
      c.providerId = soul.id;
    } catch (e) {
      c.status = "failed";
      c.error = e instanceof Error ? e.message : "학습 시작 실패";
    }
  });
}

/** Soul ID(custom-reference) 생성 — model_version 지정 (v1 | v2 | cinema) */
async function createSoulIdRaw(
  creds: { apiKey: string; apiSecret: string },
  name: string,
  imageUrls: string[],
  modelVersion: string,
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${PLATFORM_BASE}/v1/custom-references`, {
    method: "POST",
    headers: {
      Authorization: `Key ${creds.apiKey}:${creds.apiSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      model_version: modelVersion,
      input_images: imageUrls.map((u) => ({ type: "image_url", image_url: u })),
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Soul ID 학습 요청 실패 (${res.status}): ${(await res.text()).slice(0, 200)}`,
    );
  }
  const d = await res.json();
  return { id: d.id ?? d.request_id, status: d.status ?? "queued" };
}

export async function refreshCharacter(c: Character): Promise<Character> {
  if (c.status === "succeeded" || c.status === "failed") return c;
  if (isDemoMode()) {
    const p = timeProgress(c.createdAt, TRAIN_MS);
    c.progress = p;
    if (p >= 100) {
      c.status = "succeeded";
      c.previewUrl = demoImage(`${c.id}-face`, 600, 800);
    }
    return c;
  }

  // 실연동: 추정 진행률(최대 95%)을 우선 표시.
  c.progress = timeProgress(c.createdAt, REAL_TRAIN_EST, 95);
  // 아직 업로드/생성요청 중이라 providerId가 없으면 실제 학습이 시작 전 — 대기.
  // (이름 매칭으로 기존 얼굴을 끌어오면 새 학습이 무시되므로 절대 하지 않는다)
  if (!c.providerId) return c;

  const now = Date.now();
  if (now - (remotePollAt.get(c.id) ?? 0) < 5000) return c;
  remotePollAt.set(c.id, now);

  try {
    const { v1 } = await clients();
    const list = await v1.listSoulIds(1, 50);
    // 이 캐릭터가 만든 정확한 Soul ID만 추적
    const item = (list.items ?? []).find((i) => i.id === c.providerId);
    if (item) {
      const st = String(item.status).toLowerCase();
      if (st === "completed") {
        c.status = "succeeded";
        c.progress = 100;
      } else if (st === "failed") {
        c.status = "failed";
        c.error =
          "Soul ID 학습 실패 — 얼굴이 또렷한 정면 사진으로 다시 시도해 주세요.";
      }
    }
  } catch {
    // 다음 폴링에서 재시도
  }
  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// 영상 생성  (Soul 이미지 → DoP 영상)
// ─────────────────────────────────────────────────────────────────────────────

export async function startVideoGeneration(
  v: VideoJob,
  opts: { character?: Character; inputImageDataUrl?: string },
): Promise<void> {
  if (isDemoMode()) {
    v.status = "processing";
    v.progress = 2;
    return;
  }

  const { character, inputImageDataUrl } = opts;

  // ── 실연동 ──
  v.status = "processing";
  v.progress = 3;
  runBg("generate", async () => {
    try {
      const { v1, v2, InputImage } = await clients();
      const scenePrompt =
        v.identityFocus && v.mode === "face"
          ? IDENTITY_PREFIX + v.prompt
          : v.prompt;

      // ── 1단계: 영상에 넣을 "장면 이미지(image_url)" 준비 ──
      let sceneUrl: string | undefined;

      if (v.mode === "image") {
        // 사진→영상: 업로드 이미지를 그대로 사용 (Soul 생략)
        if (!inputImageDataUrl) throw new Error("입력 이미지가 없어요.");
        const { buf, fmt } = dataUrlToBuffer(inputImageDataUrl);
        sceneUrl = await v1.uploadImage(buf, fmt);
      } else {
        // 얼굴/텍스트 → Soul 텍스트→이미지로 장면 생성
        const soulInput: Record<string, unknown> = {
          prompt: scenePrompt,
          width_and_height: SIZE_BY_ASPECT[v.aspectRatio],
          quality: "1080p",
          batch_size: 1,
          enhance_prompt: true,
        };
        if (v.mode === "face" && character) {
          if (character.providerId) {
            soulInput.custom_reference_id = character.providerId;
            soulInput.custom_reference_strength = v.identityFocus ? 1 : 0.9;
          } else if (character.baseImageUrl) {
            soulInput.image_reference = InputImage.fromUrl(character.baseImageUrl);
          }
        }
        const soulRes = await v2.subscribe(resolveImageModel(v.imageModel).model, {
          input: soulInput,
          withPolling: true,
        });
        sceneUrl = soulRes.images?.[0]?.url;
        if (soulRes.status !== "completed" || !sceneUrl) {
          v.status = "failed";
          v.error = `이미지 생성 ${soulRes.status}`;
          return;
        }
      }

      v.posterUrl = sceneUrl;
      v.progress = 60;

      // ── 2단계: 선택한 영상 엔진으로 이미지→영상 (모든 엔진 {image_url, prompt}) ──
      const dopRes = await v2.subscribe(resolveEngine(v.engine).model, {
        input: { image_url: sceneUrl, prompt: v.prompt },
        withPolling: true,
      });
      const videoUrl = dopRes.video?.url;
      if (dopRes.status !== "completed" || !videoUrl) {
        v.status = "failed";
        v.error = `영상 생성 ${dopRes.status}`;
        return;
      }
      v.videoUrl = videoUrl;
      v.status = "succeeded";
      v.progress = 100;
    } catch (e) {
      v.status = "failed";
      v.error = e instanceof Error ? e.message : "생성 오류";
    }
  });
}

export async function refreshVideo(v: VideoJob): Promise<VideoJob> {
  if (v.status === "succeeded" || v.status === "failed") return v;
  if (isDemoMode()) {
    const p = timeProgress(v.createdAt, GEN_MS);
    v.progress = p;
    if (p >= 100) {
      v.status = "succeeded";
      v.videoUrl = DEMO_VIDEOS[hashToInt(v.id) % DEMO_VIDEOS.length];
      v.posterUrl = demoImage(`${v.id}-poster`, 720, 1280);
    }
    return v;
  }
  // 실연동: 백그라운드 작업이 완료 시 상태/URL을 채움. 그 전엔 추정 진행률.
  if (!v.posterUrl) v.progress = timeProgress(v.createdAt, REAL_GEN_EST, 55);
  else v.progress = Math.max(v.progress, 60);
  return v;
}

// ─────────────────────────────────────────────────────────────────────────────
// 학습된 얼굴 보관함 — Higgsfield에 영구 저장된 Soul ID(custom-references) 조회
// 서버를 재시작해도 이전에 학습한 얼굴이 계속 보이도록.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderFace {
  providerId: string;
  name: string;
  status: string; // completed | failed | in_progress | queued | not_ready
  thumbnailUrl: string | null;
  modelVersion?: string;
  createdAt: number;
}

export async function listProviderFaces(): Promise<ProviderFace[]> {
  if (isDemoMode()) return [];
  const creds = readCredentials();
  if (!creds) return [];
  try {
    const res = await fetch(
      `${PLATFORM_BASE}/v1/custom-references/list?page=1&page_size=50`,
      { headers: { Authorization: `Key ${creds.apiKey}:${creds.apiSecret}` } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: {
        id: string;
        name?: string;
        status?: string;
        thumbnail_url?: string | null;
        model_version?: string;
        created_at?: string;
      }[];
    };
    return (data.items ?? []).map((it) => ({
      providerId: it.id,
      name: it.name?.trim() || "캐릭터",
      status: String(it.status ?? ""),
      thumbnailUrl: it.thumbnail_url ?? null,
      modelVersion: it.model_version,
      createdAt: it.created_at ? Date.parse(it.created_at) : 0,
    }));
  } catch {
    return [];
  }
}
