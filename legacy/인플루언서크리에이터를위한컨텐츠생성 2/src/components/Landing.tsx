"use client";

// 판매용 랜딩 — "컨텐츠 PD를 해고하세요" 브랜드 메시지
// onStart: 실제 스튜디오(#studio)로 스크롤

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-28 pb-24">
      <Hero onStart={onStart} />
      <Comparison />
      <Features />
      <HowItWorks />
      <Pricing onStart={onStart} />
      <FinalCta onStart={onStart} />
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="fade-up pt-10 text-center sm:pt-16">
      <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-200">
        🔥 촬영팀 ✕ &nbsp; 편집자 ✕ &nbsp; 컨텐츠 PD ✕
      </div>
      <h1 className="text-balance text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
        당신의 컨텐츠 PD를
        <br />
        <span className="grad-text">해고하세요.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
        사진 한 장이면 끝. AI가 당신의 얼굴 그대로 릴스·광고·쇼츠를{" "}
        <b className="text-white/85">무한으로</b> 찍어냅니다.
        <br className="hidden sm:block" />
        촬영장도, 편집자도, 매달 나가던 외주비도 이제 안녕.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={onStart}
          className="btn-glow w-full rounded-2xl px-8 py-4 text-base font-bold text-white sm:w-auto"
        >
          🚀 무료로 영상 만들기
        </button>
        <a
          href="#how"
          className="glass glass-hover w-full rounded-2xl px-8 py-4 text-base font-bold sm:w-auto"
        >
          어떻게 되는지 보기
        </a>
      </div>
      <p className="mt-6 text-xs text-white/35">
        신용카드 불필요 · 1분 만에 첫 영상 · 워터마크 무료 체험
      </p>

      {/* 스탯 바 */}
      <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4">
        {[
          ["영상당 비용", "₩300~", "외주 대비 99%↓"],
          ["제작 시간", "3분", "촬영·편집 0일"],
          ["필요 인력", "0명", "혼자서 스튜디오"],
        ].map(([k, v, s]) => (
          <div key={k} className="glass rounded-2xl p-5">
            <div className="text-2xl font-black grad-text sm:text-3xl">{v}</div>
            <div className="mt-1 text-[13px] font-semibold">{k}</div>
            <div className="text-[11px] text-white/40">{s}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  const before = [
    "촬영팀·스튜디오 섭외와 대여",
    "장소·의상·메이크업 세팅",
    "편집자 외주 (컷·자막·색보정)",
    "PD 디렉션과 수정 핑퐁",
    "영상 1개에 수십만 원 · 며칠",
  ];
  const after = [
    "사진 한 번만 업로드",
    "스타일·장면 클릭으로 선택",
    "AI가 촬영·편집·연출 한 번에",
    "프롬프트만 바꾸면 무한 변주",
    "영상 1개에 몇백 원 · 몇 분",
  ];
  return (
    <section className="fade-up">
      <SectionHead
        eyebrow="왜 바꿔야 하나"
        title={
          <>
            지금까지의 컨텐츠 제작은
            <br />
            <span className="text-white/45">너무 비싸고 느렸습니다.</span>
          </>
        }
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="glass rounded-3xl p-7 ring-1 ring-rose-400/10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-200">
            기존 방식 😮‍💨
          </div>
          <ul className="space-y-3.5">
            {before.map((t) => (
              <li key={t} className="flex gap-3 text-sm text-white/60">
                <span className="mt-0.5 text-rose-400/70">✕</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-3xl p-7 ring-1 ring-emerald-400/20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
            FIRECAST 🔥
          </div>
          <ul className="space-y-3.5">
            {after.map((t) => (
              <li key={t} className="flex gap-3 text-sm text-white/85">
                <span className="mt-0.5 text-emerald-300">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      emoji: "🧑‍🎤",
      title: "얼굴 영상",
      desc: "사진으로 얼굴을 학습시키면, 똑같은 얼굴로 어떤 장면·의상이든 무한 생산. 한 번 학습하면 평생 재사용.",
    },
    {
      emoji: "✍️",
      title: "텍스트 → 영상",
      desc: "한 줄만 쓰면 AI가 장면을 그리고 영상으로 움직여요. 얼굴 없이도 광고·B-roll 즉석 제작.",
    },
    {
      emoji: "🖼️",
      title: "사진 → 영상",
      desc: "제품 사진·풍경·캐릭터 어떤 이미지든 올리면 살아 움직이는 영상으로. 정적인 컷이 광고가 됩니다.",
    },
    {
      emoji: "🎯",
      title: "닮음 우선 모드",
      desc: "얼굴 일관성을 극대화해 '딱 봐도 그 사람'. 시리즈 컨텐츠도 같은 인물로 통일감 있게.",
    },
    {
      emoji: "📐",
      title: "플랫폼별 비율",
      desc: "릴스·쇼츠·틱톡(9:16), 피드(1:1), 유튜브(16:9) 한 번에. 채널마다 따로 만들 필요 없어요.",
    },
    {
      emoji: "💎",
      title: "고화질 엔진",
      desc: "빠름·균형·고화질 선택. 최고 화질 모델로 광고에 바로 쓰는 퀄리티까지.",
    },
  ];
  return (
    <section className="fade-up">
      <SectionHead
        eyebrow="무엇이 되나"
        title={
          <>
            혼자서 <span className="grad-text">컨텐츠 군단</span>을 굴립니다
          </>
        }
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="glass glass-hover rounded-3xl p-6">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 text-2xl">
              {it.emoji}
            </div>
            <h3 className="text-base font-bold">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "사진 업로드", "얼굴 사진 몇 장을 올리면 AI가 학습. (또는 바로 텍스트/사진 모드)"],
    ["02", "스타일 선택", "시네마틱·패션·뷰티 등 스타일과 장면을 클릭으로 고르기."],
    ["03", "1클릭 생성", "몇 분 뒤 완성된 영상이 갤러리에. 다운로드해서 바로 업로드."],
  ];
  return (
    <section id="how" className="fade-up scroll-mt-24">
      <SectionHead eyebrow="이렇게 일합니다" title="3단계, 끝." />
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <div key={n} className="glass rounded-3xl p-7">
            <div className="text-4xl font-black grad-text">{n}</div>
            <h3 className="mt-3 text-lg font-bold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ onStart }: { onStart: () => void }) {
  const plans = [
    {
      name: "Free",
      price: "₩0",
      per: "체험",
      tagline: "맛보기로 충분",
      features: ["월 3개 영상", "워터마크 포함", "기본 화질", "얼굴 1개 학습"],
      cta: "무료로 시작",
      highlight: false,
    },
    {
      name: "Creator",
      price: "₩29,000",
      per: "/월",
      tagline: "1인 크리에이터에 딱",
      features: [
        "월 50개 영상",
        "워터마크 제거",
        "고화질 엔진",
        "얼굴 3개 학습",
        "모든 생성 모드",
      ],
      cta: "PD 해고하기 🔥",
      highlight: true,
    },
    {
      name: "Studio",
      price: "₩99,000",
      per: "/월",
      tagline: "브랜드·에이전시용",
      features: [
        "무제한 영상",
        "우선 처리 (빠른 큐)",
        "얼굴 무제한 · 팀 공유",
        "다국어 더빙 (출시 예정)",
        "API · 브랜드 제거",
      ],
      cta: "도입 문의",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="fade-up scroll-mt-24">
      <SectionHead
        eyebrow="요금"
        title={
          <>
            PD 한 명 월급으로
            <br />
            <span className="grad-text">1년치 컨텐츠</span>를 만드세요
          </>
        }
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl p-7 ${
              p.highlight
                ? "glass ring-2 ring-fuchsia-400/50"
                : "glass glass-hover"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-bold">
                가장 인기
              </div>
            )}
            <div className="text-sm font-bold text-white/70">{p.name}</div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-black">{p.price}</span>
              <span className="mb-1 text-sm text-white/45">{p.per}</span>
            </div>
            <div className="mt-1 text-xs text-white/45">{p.tagline}</div>
            <ul className="mt-5 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-white/70">
                  <span className="text-emerald-300">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onStart}
              className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold transition ${
                p.highlight
                  ? "btn-glow text-white"
                  : "border border-white/15 hover:border-white/35"
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-white/35">
        * 베타 기간 한정 가격 · 언제든 해지 가능
      </p>
    </section>
  );
}

function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="fade-up">
      <div className="glass relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20" />
        <h2 className="relative text-3xl font-black leading-tight sm:text-5xl">
          오늘부터, 당신이 <span className="grad-text">스튜디오</span>입니다
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-sm text-white/60 sm:text-base">
          첫 영상은 1분이면 나옵니다. 카드도, PD도 필요 없어요.
        </p>
        <button
          onClick={onStart}
          className="btn-glow relative mt-8 rounded-2xl px-10 py-4 text-base font-bold text-white"
        >
          🔥 지금 무료로 시작
        </button>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-300/80">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
