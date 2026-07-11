"use client";

import { useMemo, useRef, useState } from "react";
import type { Character, GenMode } from "@/lib/types";
import { PRESETS, ASPECTS } from "@/lib/presets";
import {
  VIDEO_ENGINES,
  IMAGE_MODELS,
  DEFAULT_ENGINE,
  DEFAULT_IMAGE_MODEL,
} from "@/lib/models";
import { fileToDataUrl } from "@/lib/client";
import { Spinner, Avatar } from "./ui";

const MODES: { id: GenMode; emoji: string; label: string; desc: string }[] = [
  { id: "face", emoji: "🧑‍🎤", label: "얼굴 영상", desc: "학습한 얼굴로" },
  { id: "text", emoji: "✍️", label: "텍스트 → 영상", desc: "글만 쓰면 영상" },
  { id: "image", emoji: "🖼️", label: "사진 → 영상", desc: "아무 사진이나" },
];

const TIER_CLS: Record<string, string> = {
  기본: "bg-white/10 text-white/60",
  프리미엄: "bg-fuchsia-500/20 text-fuchsia-200",
  최상위: "bg-amber-500/20 text-amber-200",
};

export interface GenerateInput {
  mode: GenMode;
  characterId?: string;
  inputImage?: string;
  prompt: string;
  preset: string;
  aspectRatio: string;
  engine: string;
  imageModel: string;
  identityFocus: boolean;
}

export function GenerateStep({
  characters,
  activeId,
  onPick,
  onGenerate,
  onBack,
  busy,
}: {
  characters: Character[];
  activeId: string | null;
  onPick: (id: string) => void;
  onGenerate: (input: GenerateInput) => Promise<void> | void;
  onBack: () => void;
  busy: boolean;
}) {
  const ready = characters.filter((c) => c.status === "succeeded");
  const [mode, setMode] = useState<GenMode>("face");
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [aspect, setAspect] = useState<string>("9:16");
  const [extra, setExtra] = useState("");
  const [engine, setEngine] = useState<string>(DEFAULT_ENGINE);
  const [imageModel, setImageModel] = useState<string>(DEFAULT_IMAGE_MODEL);
  const [identityFocus, setIdentityFocus] = useState(true);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0],
    [presetId],
  );
  const active = ready.find((c) => c.id === activeId) ?? ready[0];

  const canGo =
    !busy &&
    (mode === "face" ? !!active : mode === "image" ? !!inputImage : true);

  async function pickImage(file: File) {
    setImgLoading(true);
    try {
      setInputImage(await fileToDataUrl(file, 1024));
    } finally {
      setImgLoading(false);
    }
  }

  function go() {
    const prompt = [preset.prompt, extra.trim()].filter(Boolean).join(". ");
    onGenerate({
      mode,
      characterId: mode === "face" ? active?.id : undefined,
      inputImage: mode === "image" ? inputImage ?? undefined : undefined,
      prompt: mode === "image" ? extra.trim() || preset.prompt : prompt,
      preset: preset.id,
      aspectRatio: aspect,
      engine,
      imageModel,
      identityFocus,
    });
  }

  return (
    <div className="fade-up space-y-7">
      {/* 모드 스위처 */}
      <div className="grid grid-cols-3 gap-2.5">
        {MODES.map((m) => {
          const sel = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`glass rounded-2xl p-4 text-center transition ${
                sel
                  ? "border-violet-400/70 ring-1 ring-violet-400/40"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className="text-2xl">{m.emoji}</div>
              <div className="mt-1.5 text-[13px] font-bold">{m.label}</div>
              <div className="text-[10px] text-white/45">{m.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
        {/* 왼쪽: 소스 (얼굴 / 텍스트안내 / 사진업로드) */}
        <div className="glass rounded-3xl p-6 sm:p-7">
          {mode === "face" && (
            <>
              <h3 className="text-sm font-bold text-white/80">학습된 얼굴 선택</h3>
              {ready.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-white/10 p-6 text-center text-sm text-white/55">
                  아직 학습된 얼굴이 없어요.
                  <button
                    onClick={onBack}
                    className="btn-glow mx-auto mt-4 block rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                  >
                    ← 얼굴 학습하러 가기
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3">
                    {ready.map((c) => {
                      const sel = active?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => onPick(c.id)}
                          className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border transition ${
                            sel
                              ? "border-fuchsia-400 ring-2 ring-fuchsia-400/40"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <Avatar
                            src={c.previewUrl ?? c.refThumbs[0]}
                            name={c.name}
                            className="h-full w-full transition group-hover:scale-105"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="truncate text-[11px] font-semibold">
                              {c.name}
                            </p>
                          </div>
                          {sel && (
                            <div className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500 text-[11px]">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={onBack}
                    className="mt-5 text-xs text-white/50 underline-offset-4 hover:text-white/80 hover:underline"
                  >
                    + 다른 얼굴 추가 학습
                  </button>
                </>
              )}
            </>
          )}

          {mode === "text" && (
            <>
              <h3 className="text-sm font-bold text-white/80">텍스트 → 영상</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                얼굴 없이 <b className="text-white/80">글(프롬프트)만으로</b> 영상을
                만들어요. 오른쪽에서 스타일과 장면 설명을 적고 생성하세요.
              </p>
              <div className="mt-5 space-y-2.5 text-sm text-white/65">
                <div className="flex gap-2">
                  <span>🎨</span> AI가 장면 이미지를 만들고
                </div>
                <div className="flex gap-2">
                  <span>🎬</span> 그걸 영상으로 움직여줘요
                </div>
              </div>
            </>
          )}

          {mode === "image" && (
            <>
              <h3 className="text-sm font-bold text-white/80">사진 → 영상</h3>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])}
              />
              {inputImage ? (
                <div className="mt-4">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={inputImage} alt="" className="max-h-72 w-full object-cover" />
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 text-xs text-white/55 underline-offset-4 hover:text-white/85 hover:underline"
                  >
                    다른 사진 선택
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-white/15 p-8 text-center transition hover:border-violet-400/50 hover:bg-white/[0.03]"
                >
                  <span className="mb-2 text-3xl">🖼️</span>
                  <span className="text-sm font-semibold">
                    {imgLoading ? "불러오는 중…" : "영상으로 만들 사진 올리기"}
                  </span>
                  <span className="mt-1 text-xs text-white/45">
                    풍경·제품·캐릭터 등 무엇이든 OK
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* 오른쪽: 스타일/연출 설정 */}
        <div className="glass rounded-3xl p-6 sm:p-7">
          <h3 className="text-sm font-bold text-white/80">
            {mode === "image" ? "움직임 스타일" : "컨텐츠 스타일"}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {PRESETS.map((p) => {
              const sel = p.id === presetId;
              return (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    sel
                      ? "border-violet-400/70 bg-violet-500/15"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <div className="text-xl">{p.emoji}</div>
                  <div className="mt-1.5 text-[12px] font-bold leading-tight">
                    {p.label}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-white/45">
                    {p.desc}
                  </div>
                </button>
              );
            })}
          </div>

          <h3 className="mt-6 text-sm font-bold text-white/80">
            {mode === "image" ? "움직임 설명" : "추가 연출"}{" "}
            <span className="font-normal text-white/40">
              {mode === "image" ? "(선택)" : "(선택)"}
            </span>
          </h3>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder={
              mode === "image"
                ? "예: 천천히 줌인, 바람에 흔들리는 느낌, 카메라가 부드럽게 이동"
                : "예: 노을 지는 해변에서 흰 셔츠를 입고 바람에 머리가 날리며 카메라를 향해 미소"
            }
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-violet-400/60 focus:bg-white/[0.07]"
          />

          <h3 className="mt-6 text-sm font-bold text-white/80">비율</h3>
          <div className="mt-3 flex gap-2.5">
            {ASPECTS.map((a) => {
              const sel = a.id === aspect;
              return (
                <button
                  key={a.id}
                  onClick={() => setAspect(a.id)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition ${
                    sel
                      ? "border-cyan-400/70 bg-cyan-500/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="text-sm font-bold">{a.label}</div>
                  <div className="text-[10px] text-white/45">{a.hint}</div>
                </button>
              );
            })}
          </div>

          <h3 className="mt-6 flex items-center gap-2 text-sm font-bold text-white/80">
            영상 엔진 <span className="text-[10px] font-normal text-white/40">상위 모델일수록 고품질·느림</span>
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {VIDEO_ENGINES.map((e) => {
              const sel = e.id === engine;
              return (
                <button
                  key={e.id}
                  onClick={() => setEngine(e.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    sel
                      ? "border-fuchsia-400/70 bg-fuchsia-500/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-bold leading-tight">{e.label}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${TIER_CLS[e.tier]}`}>
                      {e.tier}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] leading-tight text-white/45">{e.hint}</div>
                </button>
              );
            })}
          </div>

          {mode !== "image" && (
            <>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-bold text-white/80">
                이미지 모델 <span className="text-[10px] font-normal text-white/40">장면 이미지 생성</span>
              </h3>
              <div className="mt-3 flex gap-2.5">
                {IMAGE_MODELS.map((m) => {
                  const sel = m.id === imageModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setImageModel(m.id)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition ${
                        sel
                          ? "border-violet-400/70 bg-violet-500/10"
                          : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="text-[12px] font-bold">{m.label}</div>
                      <div className="text-[10px] text-white/45">{m.hint}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "face" && (
            <button
              onClick={() => setIdentityFocus((v) => !v)}
              className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                identityFocus
                  ? "border-emerald-400/50 bg-emerald-500/10"
                  : "border-white/10"
              }`}
            >
              <span>
                <span className="text-sm font-bold">🎯 닮음 우선 모드</span>
                <span className="mt-0.5 block text-[11px] text-white/45">
                  클로즈업·정면·움직임 최소로 얼굴을 더 똑같이 유지
                </span>
              </span>
              <span
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
                  identityFocus ? "bg-emerald-500" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    identityFocus ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          )}

          <button
            disabled={!canGo}
            onClick={go}
            className="btn-glow mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white"
          >
            {busy ? (
              <>
                <Spinner /> 영상 생성 요청중…
              </>
            ) : mode === "face" ? (
              <>🎬 {active?.name ?? "얼굴"}(으)로 영상 생성</>
            ) : mode === "text" ? (
              <>🎬 텍스트로 영상 생성</>
            ) : (
              <>🎬 사진으로 영상 생성</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
