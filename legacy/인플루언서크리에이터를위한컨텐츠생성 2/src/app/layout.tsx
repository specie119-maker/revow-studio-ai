import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRECAST — 당신의 컨텐츠 PD를 해고하세요",
  description:
    "사진 한 장이면 끝. AI가 당신의 얼굴 그대로 릴스·광고·쇼츠를 무한 생산합니다. 촬영팀도, 편집자도, PD도 필요 없는 AI 컨텐츠 스튜디오. Powered by Higgsfield.",
  applicationName: "FIRECAST",
};

export const viewport: Viewport = {
  themeColor: "#07070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>
        <div className="aurora" />
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
