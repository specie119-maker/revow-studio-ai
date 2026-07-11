// 인플루언서/크리에이터용 컨텐츠 프리셋.
// label은 UI 표시용, prompt는 생성 프롬프트에 합쳐지는 시드 문장.

export interface Preset {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  prompt: string;
}

export const PRESETS: Preset[] = [
  {
    id: "cinematic",
    label: "시네마틱 인트로",
    emoji: "🎬",
    desc: "영화 같은 카메라 무빙과 조명",
    prompt:
      "cinematic intro, slow dolly-in, dramatic rim lighting, shallow depth of field, the person looks into the camera and smiles confidently",
  },
  {
    id: "fashion",
    label: "패션 룩북",
    emoji: "🧥",
    desc: "런웨이 무드의 패션 필름",
    prompt:
      "high-fashion lookbook, editorial studio lighting, the person turns and poses, fabric flows, vogue magazine aesthetic",
  },
  {
    id: "beauty",
    label: "뷰티 광고",
    emoji: "💄",
    desc: "클로즈업 뷰티 커머셜",
    prompt:
      "beauty commercial close-up, soft glowing skin, gentle head turn, makes eye contact, premium cosmetics ad vibe",
  },
  {
    id: "vlog",
    label: "브이로그 토킹",
    emoji: "🎙️",
    desc: "말하는 듯한 자연스러운 무빙",
    prompt:
      "casual vlog talking-head, natural handheld motion, the person speaks to the camera with friendly expressions, warm daylight",
  },
  {
    id: "dance",
    label: "댄스 챌린지",
    emoji: "💃",
    desc: "리듬감 있는 숏폼 댄스",
    prompt:
      "energetic short-form dance challenge, dynamic body movement, neon club lighting, trendy TikTok/Reels vibe",
  },
  {
    id: "unboxing",
    label: "제품 언박싱",
    emoji: "📦",
    desc: "제품을 소개하는 커머스 컷",
    prompt:
      "product showcase, the person presents an item to the camera, clean bright studio, e-commerce commercial style",
  },
  {
    id: "travel",
    label: "여행 브이로그",
    emoji: "🌅",
    desc: "감성적인 여행 무드",
    prompt:
      "travel vlog, golden hour, the person looks around in awe, scenic background, cinematic wide shot, wind in hair",
  },
  {
    id: "kpop",
    label: "K-pop M/V",
    emoji: "🎤",
    desc: "뮤직비디오 한 컷 느낌",
    prompt:
      "kpop music video shot, stylish lighting, the person performs to the camera, high contrast colors, idol aesthetic",
  },
];

export const ASPECTS: { id: "9:16" | "1:1" | "16:9"; label: string; hint: string }[] =
  [
    { id: "9:16", label: "9:16", hint: "릴스 · 쇼츠 · 틱톡" },
    { id: "1:1", label: "1:1", hint: "피드 정사각" },
    { id: "16:9", label: "16:9", hint: "유튜브 가로" },
  ];
