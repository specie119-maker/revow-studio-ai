// 사용 가능한 AI 모델 레지스트리 (계정에서 접근 가능 확인됨).
// 모든 영상 엔진은 { image_url, prompt } 형식, Soul은 { prompt, ... } 형식.

export type Tier = "기본" | "프리미엄" | "최상위";

export interface VideoEngine {
  id: string;
  model: string; // subscribe 엔드포인트(model_id)
  label: string;
  tier: Tier;
  hint: string;
}

export const VIDEO_ENGINES: VideoEngine[] = [
  { id: "dop-lite", model: "higgsfield-ai/dop/lite", label: "DoP 빠름", tier: "기본", hint: "가장 빠르고 저렴" },
  { id: "dop-turbo", model: "higgsfield-ai/dop/turbo", label: "DoP 균형", tier: "기본", hint: "속도·품질 균형" },
  { id: "dop-standard", model: "higgsfield-ai/dop/standard", label: "DoP 고화질", tier: "기본", hint: "Higgsfield 고화질" },
  { id: "kling-pro", model: "kling-video/v2.1/pro/image-to-video", label: "Kling 2.1 Pro", tier: "프리미엄", hint: "디테일·움직임 우수" },
  { id: "kling-master", model: "kling-video/v2.1/master/image-to-video", label: "Kling 2.1 Master", tier: "최상위", hint: "최고 품질 (느림)" },
  { id: "hailuo", model: "minimax/hailuo-02/pro/image-to-video", label: "Hailuo 02 Pro", tier: "프리미엄", hint: "인물·표정 강함" },
];

export const DEFAULT_ENGINE = "kling-pro"; // 상위 모델을 기본으로

export interface ImageModel {
  id: string;
  model: string;
  label: string;
  hint: string;
}

export const IMAGE_MODELS: ImageModel[] = [
  { id: "character", model: "higgsfield-ai/soul/character", label: "Soul 캐릭터", hint: "얼굴 일관성 특화 (추천)" },
  { id: "standard", model: "higgsfield-ai/soul/standard", label: "Soul 표준", hint: "범용 고화질" },
  { id: "cinema", model: "higgsfield-ai/soul/cinema", label: "Soul 시네마", hint: "영화 같은 톤" },
];

export const DEFAULT_IMAGE_MODEL = "character";

// 얼굴 학습(Soul ID) 모델 — model_version: 'v1' | 'v2' | 'cinema'
export interface TrainModel {
  id: string;
  label: string;
  hint: string;
}
export const TRAIN_MODELS: TrainModel[] = [
  { id: "v2", label: "정밀 v2", hint: "닮음 최고 · 추천" },
  { id: "cinema", label: "시네마", hint: "영화 톤 인물" },
  { id: "v1", label: "기본 v1", hint: "빠른 기본" },
];
export const DEFAULT_TRAIN_MODEL = "v2";
export function resolveTrainModel(id: string | undefined): string {
  return TRAIN_MODELS.find((m) => m.id === id)?.id ?? DEFAULT_TRAIN_MODEL;
}

export function resolveEngine(id: string | undefined): VideoEngine {
  return (
    VIDEO_ENGINES.find((e) => e.id === id) ??
    VIDEO_ENGINES.find((e) => e.id === DEFAULT_ENGINE)!
  );
}

export function resolveImageModel(id: string | undefined): ImageModel {
  return IMAGE_MODELS.find((m) => m.id === id) ?? IMAGE_MODELS[0];
}
