"use client";

import type { Character, VideoJob } from "@/lib/types";
import { PRESETS } from "@/lib/presets";
import { resolveEngine } from "@/lib/models";
import { ProgressRing, StatusPill, Avatar } from "./ui";

const ASPECT_CLASS: Record<string, string> = {
  "9:16": "aspect-[9/16]",
  "1:1": "aspect-square",
  "16:9": "aspect-video",
};

export function Gallery({
  videos,
  characters,
  onDelete,
}: {
  videos: VideoJob[];
  characters: Character[];
  onDelete?: (id: string) => void;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold">내 컨텐츠</h2>
          <p className="text-sm text-white/45">
            생성한 영상이 여기에 모여요 · 총 {videos.length}개
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const char = characters.find((c) => c.id === v.characterId);
          const preset = PRESETS.find((p) => p.id === v.preset);
          return (
            <div
              key={v.id}
              className="glass glass-hover fade-up overflow-hidden rounded-3xl"
            >
              <div
                className={`relative ${ASPECT_CLASS[v.aspectRatio] ?? "aspect-[9/16]"} bg-black/40`}
              >
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm("이 영상을 삭제할까요?")) onDelete(v.id);
                    }}
                    className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white/90 backdrop-blur transition hover:bg-rose-500"
                    aria-label="삭제"
                    title="삭제"
                  >
                    🗑
                  </button>
                )}
                {v.status === "succeeded" && v.videoUrl ? (
                  <video
                    src={v.videoUrl}
                    poster={v.posterUrl}
                    controls
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : v.status === "failed" ? (
                  <div className="grid h-full place-items-center p-6 text-center">
                    <div>
                      <div className="text-2xl">⚠️</div>
                      <p className="mt-2 text-sm text-rose-200">생성 실패</p>
                      <p className="mt-1 text-[11px] text-white/40">{v.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full place-items-center">
                    <ProgressRing value={v.progress} label="생성중" />
                    <div className="shimmer pointer-events-none absolute inset-0" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    {preset?.emoji} {preset?.label ?? v.preset}
                  </span>
                  <StatusPill status={v.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/45">
                  {v.prompt}
                </p>
                <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
                  {char ? (
                    <Avatar
                      src={char.previewUrl ?? char.refThumbs[0]}
                      name={char.name}
                      className="h-6 w-6 rounded-full text-[10px]"
                    />
                  ) : (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[11px]">
                      {v.mode === "text" ? "✍️" : v.mode === "image" ? "🖼️" : "🎭"}
                    </span>
                  )}
                  <span className="text-[11px] text-white/55">
                    {v.sourceLabel} · {v.aspectRatio} · {resolveEngine(v.engine).label}
                  </span>
                  {v.status === "succeeded" && v.videoUrl && (
                    <a
                      href={v.videoUrl}
                      download
                      className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/20"
                    >
                      ↓ 저장
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
