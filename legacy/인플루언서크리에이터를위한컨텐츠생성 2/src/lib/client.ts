"use client";

import type { Character, VideoJob } from "./types";

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || r.statusText);
  return r.json();
}
async function jpost<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || r.statusText);
  return r.json();
}

export const api = {
  meta: () => jget<{ demo: boolean }>("/api/meta"),
  listCharacters: () => jget<{ characters: Character[] }>("/api/characters"),
  getCharacter: (id: string) =>
    jget<{ character: Character }>(`/api/characters/${id}`),
  createCharacter: (name: string, images: string[], modelVersion: string) =>
    jpost<{ character: Character }>("/api/characters", {
      name,
      images,
      modelVersion,
    }),
  listVideos: () => jget<{ videos: VideoJob[] }>("/api/generate"),
  getVideo: (id: string) => jget<{ video: VideoJob }>(`/api/jobs/${id}`),
  deleteVideo: async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
  },
  createVideo: (input: {
    mode: string;
    characterId?: string;
    inputImage?: string;
    prompt: string;
    preset: string;
    aspectRatio: string;
    engine: string;
    imageModel: string;
    identityFocus: boolean;
  }) => jpost<{ video: VideoJob }>("/api/generate", input),
};

/**
 * 업로드 이미지를 브라우저에서 미리 리사이즈/압축해 data URL로 변환.
 * 전송 용량을 줄이고 서버 부담을 낮춘다. (최대 변 maxSize px, JPEG)
 */
export function fileToDataUrl(file: File, maxSize = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas 미지원"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없어요."));
    };
    img.src = url;
  });
}
