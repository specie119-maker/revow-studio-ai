"use client";

import type { Character } from "@/lib/types";
import { ProgressRing } from "./ui";

export function TrainingCard({
  character,
  onProceed,
}: {
  character: Character;
  onProceed: (id: string) => void;
}) {
  const done = character.status === "succeeded";
  const failed = character.status === "failed";

  return (
    <div className="glass fade-up mb-7 flex flex-col items-center gap-6 rounded-3xl p-7 sm:flex-row sm:p-8">
      <div className="relative">
        {done && character.previewUrl ? (
          <div className="pulse-ring relative h-[132px] w-[132px] overflow-hidden rounded-full border-2 border-emerald-400/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.previewUrl}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : failed ? (
          <div className="grid h-[132px] w-[132px] place-items-center rounded-full border-2 border-rose-400/40 text-3xl">
            ⚠️
          </div>
        ) : (
          <ProgressRing value={character.progress} label="얼굴 학습중" />
        )}
      </div>

      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <h3 className="text-lg font-bold">{character.name}</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
            {character.refThumbs.length}장 학습
          </span>
        </div>

        {done ? (
          <p className="mt-1.5 text-sm text-emerald-200">
            ✓ 얼굴 학습 완료! 이제 이 얼굴로 영상을 만들 수 있어요.
          </p>
        ) : failed ? (
          <p className="mt-1.5 text-sm text-rose-200">
            학습에 실패했어요. {character.error}
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-white/55">
            AI가 얼굴을 정밀 학습 중이에요. 보통 <b className="text-white/80">3~8분</b>{" "}
            걸려요 — 95%에서 잠시 멈춘 듯 보여도 정상이에요. ☕
          </p>
        )}

        {/* 참조 썸네일 */}
        <div className="mt-4 flex justify-center gap-2 sm:justify-start">
          {character.refThumbs.slice(0, 5).map((src, i) => (
            <div
              key={i}
              className="h-10 w-10 overflow-hidden rounded-lg border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {done && (
          <button
            onClick={() => onProceed(character.id)}
            className="btn-glow mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white"
          >
            🎬 이 얼굴로 영상 만들기 →
          </button>
        )}
      </div>
    </div>
  );
}
