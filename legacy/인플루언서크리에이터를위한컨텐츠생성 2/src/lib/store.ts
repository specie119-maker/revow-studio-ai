// MVP용 인메모리 저장소.
// ⚠️ 개발 서버 재시작 시 초기화됩니다. 운영에서는 DB(Postgres 등)로 교체하세요.
//
// Next.js dev 모드의 HMR로 모듈이 재평가되어도 상태가 날아가지 않도록
// globalThis에 캐싱합니다.

import type { Character, VideoJob } from "./types";

type DB = {
  characters: Map<string, Character>;
  videos: Map<string, VideoJob>;
};

const g = globalThis as unknown as { __facecastDB?: DB };

export const db: DB =
  g.__facecastDB ??
  (g.__facecastDB = {
    characters: new Map(),
    videos: new Map(),
  });

export function newId(prefix: string): string {
  // 충돌 거의 없는 짧은 ID
  const rnd = Math.random().toString(36).slice(2, 8);
  const t = Date.now().toString(36);
  return `${prefix}_${t}${rnd}`;
}
