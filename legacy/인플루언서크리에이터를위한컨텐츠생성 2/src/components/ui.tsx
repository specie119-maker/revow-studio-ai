"use client";

import type { JobStatus } from "@/lib/types";

/** 원형 진행률 인디케이터 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 9,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#e879f9" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold tabular-nums">{Math.round(value)}%</div>
        {label && <div className="mt-0.5 text-[11px] text-white/50">{label}</div>}
      </div>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`spin-slow inline-block h-4 w-4 rounded-full border-2 border-white/25 border-t-white ${className}`}
    />
  );
}

/** 썸네일이 있으면 이미지, 없으면 이름 이니셜 그라데이션 아바타 */
export function Avatar({
  src,
  name,
  className = "",
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`object-cover ${className}`} />;
  }
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return (
    <div
      className={`grid place-items-center font-bold text-white ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 45%))`,
      }}
    >
      <span className="text-[1.4em]">{initial}</span>
    </div>
  );
}

const STATUS_MAP: Record<JobStatus, { text: string; cls: string }> = {
  queued: { text: "대기중", cls: "bg-white/10 text-white/70" },
  processing: { text: "처리중", cls: "bg-violet-500/20 text-violet-200" },
  succeeded: { text: "완료", cls: "bg-emerald-500/20 text-emerald-200" },
  failed: { text: "실패", cls: "bg-rose-500/20 text-rose-200" },
};

export function StatusPill({ status }: { status: JobStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      {status === "processing" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {s.text}
    </span>
  );
}
