// 도메인 타입 정의 — 프론트/백엔드 공용

export type JobStatus = "queued" | "processing" | "succeeded" | "failed";

/** 사용자가 업로드한 사진으로 학습시킨 "얼굴(Soul 캐릭터)" */
export interface Character {
  id: string;
  name: string;
  /** 학습 진행 상태 */
  status: JobStatus;
  /** 0~100 */
  progress: number;
  /** 업로드한 참조 사진 미리보기(data URL 또는 외부 URL) */
  refThumbs: string[];
  /** 학습 완료 후 대표 프리뷰 이미지 */
  previewUrl?: string;
  /** Higgsfield Soul ID (실연동 시 채워짐). 이미지 생성 때 custom_reference_id로 사용 */
  providerId?: string;
  /** 업로드된 참조 사진의 CDN URL (image_reference 폴백/포스터용) */
  baseImageUrl?: string;
  /** 학습에 쓴 모델 버전 (v1 | v2 | cinema) */
  modelVersion?: string;
  createdAt: number;
  error?: string;
}

/** 학습된 얼굴로 만든 컨텐츠 영상 생성 작업 */
/** 생성 모드: 얼굴 영상 / 텍스트→영상 / 사진→영상 */
export type GenMode = "face" | "text" | "image";

export interface VideoJob {
  id: string;
  mode: GenMode;
  /** face 모드일 때 캐릭터 ID */
  characterId?: string;
  /** 갤러리 표시용 라벨 (캐릭터 이름 / "텍스트" / "내 사진") */
  sourceLabel: string;
  prompt: string;
  preset: string;
  aspectRatio: "9:16" | "1:1" | "16:9";
  /** 영상 엔진 id (models.ts VIDEO_ENGINES) */
  engine: string;
  /** 이미지(Soul) 모델 id (models.ts IMAGE_MODELS) */
  imageModel: string;
  /** 닮음 우선 모드 (클로즈업·정면·움직임 최소로 얼굴 일관성 강화) */
  identityFocus: boolean;
  status: JobStatus;
  progress: number;
  /** 결과 영상 URL */
  videoUrl?: string;
  /** 썸네일/포스터 이미지 URL */
  posterUrl?: string;
  providerId?: string;
  createdAt: number;
  error?: string;
}

export interface CreateCharacterInput {
  name: string;
  images: string[]; // data URL 배열
  modelVersion?: string; // v1 | v2 | cinema
}

export interface CreateVideoInput {
  mode: GenMode;
  characterId?: string;
  /** image 모드: 업로드한 사진 data URL */
  inputImage?: string;
  prompt: string;
  preset: string;
  aspectRatio: VideoJob["aspectRatio"];
  engine: string;
  imageModel: string;
  identityFocus: boolean;
}
