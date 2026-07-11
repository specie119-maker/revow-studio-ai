"use client";

import { useCallback, useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/client";
import { TRAIN_MODELS, DEFAULT_TRAIN_MODEL } from "@/lib/models";
import { Spinner } from "./ui";

export function UploadStep({
  onCreate,
  busy,
}: {
  onCreate: (
    name: string,
    images: string[],
    modelVersion: string,
  ) => Promise<void> | void;
  busy: boolean;
}) {
  const [name, setName] = useState("");
  const [modelVersion, setModelVersion] = useState(DEFAULT_TRAIN_MODEL);
  const [images, setImages] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setErr(null);
      const arr = [...files].filter((f) => f.type.startsWith("image/"));
      if (!arr.length) return;
      setLoading(true);
      try {
        const next = await Promise.all(arr.map((f) => fileToDataUrl(f)));
        setImages((cur) => [...cur, ...next].slice(0, 8));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "이미지 처리 실패");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const canSubmit = images.length >= 1 && !busy && !loading;

  return (
    <div className="fade-up grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
      {/* 업로드 영역 */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <label className="mb-2 block text-sm font-semibold text-white/80">
          캐릭터 이름
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 지수 인플루언서"
          maxLength={40}
          className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-violet-400/60 focus:bg-white/[0.07]"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`group cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
            drag
              ? "border-fuchsia-400/70 bg-fuchsia-500/10"
              : "border-white/15 hover:border-violet-400/50 hover:bg-white/[0.03]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 text-2xl transition group-hover:scale-110">
            📸
          </div>
          <p className="text-sm font-semibold">
            얼굴 사진을 끌어다 놓거나 클릭해서 업로드
          </p>
          <p className="mt-1 text-xs text-white/45">
            정면·다양한 각도 3~5장 권장 · 최대 8장 · JPG/PNG
          </p>
          {loading && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-violet-200">
              <Spinner /> 이미지 처리중…
            </p>
          )}
        </div>

        {err && <p className="mt-3 text-xs text-rose-300">{err}</p>}

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
            {images.map((src, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImages((cur) => cur.filter((_, idx) => idx !== i));
                  }}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[11px] opacity-0 transition group-hover:opacity-100"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
            학습 모델{" "}
            <span className="text-[10px] font-normal text-white/40">
              정밀할수록 더 똑같이 학습돼요
            </span>
          </label>
          <div className="flex gap-2.5">
            {TRAIN_MODELS.map((m) => {
              const sel = m.id === modelVersion;
              return (
                <button
                  key={m.id}
                  onClick={() => setModelVersion(m.id)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-center transition ${
                    sel
                      ? "border-emerald-400/70 bg-emerald-500/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="text-[13px] font-bold">{m.label}</div>
                  <div className="text-[10px] text-white/45">{m.hint}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => onCreate(name, images, modelVersion)}
          className="btn-glow mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white"
        >
          {busy ? (
            <>
              <Spinner /> 학습 시작 중…
            </>
          ) : (
            <>✨ 이 얼굴 학습시키기</>
          )}
        </button>
      </div>

      {/* 안내 패널 */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h3 className="text-base font-bold">좋은 결과를 위한 팁</h3>
        <ul className="mt-4 space-y-3.5 text-sm text-white/70">
          {[
            ["💡", "얼굴이 선명하고 밝게 나온 사진일수록 닮음도가 높아요."],
            ["🔄", "정면 1~2장 + 좌우/위아래 각도를 섞으면 더 자연스러워요."],
            ["🚫", "선글라스·과한 필터·여러 사람이 함께 나온 사진은 피하세요."],
            ["⚡", "학습은 보통 수십 초~수 분. 완료되면 바로 영상 생성으로!"],
          ].map(([e, t]) => (
            <li key={t} className="flex gap-3">
              <span className="text-lg leading-none">{e}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-4 text-xs leading-relaxed text-white/60">
          업로드한 사진은 <b className="text-white/80">본인 또는 사용 동의를 받은
          인물</b>만 사용하세요. 타인의 얼굴을 무단으로 학습·생성하는 것은
          금지됩니다.
        </div>
      </div>
    </div>
  );
}
