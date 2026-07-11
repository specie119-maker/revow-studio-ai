"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Character, VideoJob } from "@/lib/types";
import { api } from "@/lib/client";
import { UploadStep } from "@/components/UploadStep";
import { GenerateStep } from "@/components/GenerateStep";
import { Gallery } from "@/components/Gallery";
import { TrainingCard } from "@/components/TrainingCard";
import { Landing } from "@/components/Landing";

type Step = "create" | "generate";

export default function Home() {
  const [demo, setDemo] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("create");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [videos, setVideos] = useState<VideoJob[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [latestTrainId, setLatestTrainId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const charsRef = useRef<Character[]>([]);
  const vidsRef = useRef<VideoJob[]>([]);
  charsRef.current = characters;
  vidsRef.current = videos;

  // 초기 로드
  useEffect(() => {
    api.meta().then((m) => setDemo(m.demo)).catch(() => setDemo(true));
    api.listCharacters().then((r) => setCharacters(r.characters)).catch(() => {});
    api.listVideos().then((r) => setVideos(r.videos)).catch(() => {});
  }, []);

  // 진행중 작업 폴링
  useEffect(() => {
    const t = setInterval(async () => {
      const pendingChars = charsRef.current.filter(
        (c) => c.status === "queued" || c.status === "processing",
      );
      const pendingVids = vidsRef.current.filter(
        (v) => v.status === "queued" || v.status === "processing",
      );
      if (!pendingChars.length && !pendingVids.length) return;

      await Promise.all([
        ...pendingChars.map(async (c) => {
          try {
            const { character } = await api.getCharacter(c.id);
            setCharacters((cur) =>
              cur.map((x) => (x.id === character.id ? character : x)),
            );
          } catch {}
        }),
        ...pendingVids.map(async (v) => {
          try {
            const { video } = await api.getVideo(v.id);
            setVideos((cur) =>
              cur.map((x) => (x.id === video.id ? video : x)),
            );
          } catch {}
        }),
      ]);
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleCreate = useCallback(
    async (name: string, images: string[], modelVersion: string) => {
      setCreating(true);
      try {
        const { character } = await api.createCharacter(
          name,
          images,
          modelVersion,
        );
        setCharacters((cur) => [character, ...cur]);
        setLatestTrainId(character.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        showToast(e instanceof Error ? e.message : "학습 시작 실패");
      } finally {
        setCreating(false);
      }
    },
    [showToast],
  );

  const handleGenerate = useCallback(
    async (input: {
      mode: string;
      characterId?: string;
      inputImage?: string;
      prompt: string;
      preset: string;
      aspectRatio: string;
      engine: string;
      imageModel: string;
      identityFocus: boolean;
    }) => {
      setGenerating(true);
      try {
        const { video } = await api.createVideo(input);
        setVideos((cur) => [video, ...cur]);
        showToast("🎬 생성을 시작했어요! 아래 갤러리에서 진행 상황을 확인하세요.");
        setTimeout(
          () =>
            document
              .getElementById("gallery")
              ?.scrollIntoView({ behavior: "smooth" }),
          200,
        );
      } catch (e) {
        showToast(e instanceof Error ? e.message : "생성 실패");
      } finally {
        setGenerating(false);
      }
    },
    [showToast],
  );

  const goGenerate = useCallback((id: string) => {
    setActiveId(id);
    setStep("generate");
    setLatestTrainId(null);
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToStudio = useCallback(() => {
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleDeleteVideo = useCallback((id: string) => {
    setVideos((cur) => cur.filter((v) => v.id !== id)); // 즉시 UI 반영
    api.deleteVideo(id).catch(() => {});
  }, []);

  const readyCount = characters.filter((c) => c.status === "succeeded").length;
  const latestTrain = characters.find((c) => c.id === latestTrainId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 sm:px-6">
      {/* 상단 네비 */}
      <header className="sticky top-0 z-40 -mx-4 flex items-center justify-between border-b border-white/[0.06] bg-ink/70 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-500 text-lg shadow-lg shadow-fuchsia-500/30">
            🔥
          </div>
          <div className="text-left leading-tight">
            <div className="text-base font-black tracking-tight">FIRECAST</div>
            <div className="text-[10px] text-white/40">AI 컨텐츠 스튜디오</div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {demo && (
            <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-200 sm:inline">
              ● 데모 모드
            </span>
          )}
          <button
            onClick={scrollToStudio}
            className="btn-glow rounded-xl px-4 py-2 text-sm font-bold text-white"
          >
            무료로 시작
          </button>
        </div>
      </header>

      {/* 판매용 랜딩 */}
      <Landing onStart={scrollToStudio} />

      {/* ───── 실제 스튜디오 ───── */}
      <section id="studio" className="scroll-mt-20 border-t border-white/[0.06] pt-16">
        <div className="mb-10 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-300/80">
            스튜디오
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            지금 바로 <span className="grad-text">만들어보기</span>
          </h2>
          <p className="mt-3 text-sm text-white/50">
            {step === "create"
              ? "사진을 올려 얼굴을 학습시키거나, 바로 텍스트·사진으로 영상을 만드세요."
              : "모드를 고르고 스타일·프롬프트를 정한 뒤 생성하세요."}
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <Stepper step={step} readyCount={readyCount} onStep={setStep} />

        {/* 본문 */}
        <div className="mt-8">
          {step === "create" ? (
            <>
              {latestTrain && (
                <TrainingCard character={latestTrain} onProceed={goGenerate} />
              )}
              <UploadStep onCreate={handleCreate} busy={creating} />
              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep("generate")}
                  className="text-sm text-white/55 underline-offset-4 hover:text-white/85 hover:underline"
                >
                  얼굴 학습 없이 바로 영상 만들기 (텍스트·사진 모드) →
                </button>
              </div>
            </>
          ) : (
            <GenerateStep
              characters={characters}
              activeId={activeId}
              onPick={setActiveId}
              onGenerate={handleGenerate}
              onBack={() => setStep("create")}
              busy={generating}
            />
          )}
        </div>

        {/* 갤러리 */}
        <div id="gallery">
          <Gallery
            videos={videos}
            characters={characters}
            onDelete={handleDeleteVideo}
          />
        </div>
      </section>

      <footer className="mt-20 border-t border-white/[0.06] pt-8 text-center text-xs text-white/35">
        <span className="font-bold text-white/60">FIRECAST</span> — 당신의 컨텐츠 PD를 해고하세요.
        <br className="sm:hidden" /> 본인 또는 동의받은 인물의 사진만 사용하세요.
        {demo && " · 현재 데모 모드"}
      </footer>

      {/* 토스트 */}
      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="glass fade-up max-w-md rounded-2xl px-5 py-3.5 text-center text-sm shadow-2xl">
            {toast}
          </div>
        </div>
      )}
    </main>
  );
}

function Stepper({
  step,
  readyCount,
  onStep,
}: {
  step: Step;
  readyCount: number;
  onStep: (s: Step) => void;
}) {
  const steps: { id: Step; n: string; label: string }[] = [
    { id: "create", n: "1", label: "얼굴 학습" },
    { id: "generate", n: "2", label: "영상 생성" },
  ];
  void readyCount;
  return (
    <div className="mx-auto flex max-w-md items-center gap-3">
      {steps.map((s, i) => {
        const active = step === s.id;
        const disabled = false; // 텍스트/사진 모드는 얼굴 없이도 생성 가능
        return (
          <div key={s.id} className="flex flex-1 items-center gap-3">
            <button
              disabled={disabled}
              onClick={() => onStep(s.id)}
              className={`flex flex-1 items-center gap-2.5 rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-violet-400/60 bg-violet-500/15"
                  : disabled
                    ? "cursor-not-allowed border-white/5 opacity-40"
                    : "border-white/10 hover:border-white/25"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                    : "bg-white/10 text-white/60"
                }`}
              >
                {s.n}
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
            </button>
            {i === 0 && <span className="text-white/20">→</span>}
          </div>
        );
      })}
    </div>
  );
}
