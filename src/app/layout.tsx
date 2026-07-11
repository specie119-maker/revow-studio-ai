import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReVow Studio AI - 소중한 기억의 복원",
  description: "당신이 꿈꾸던 그 순간을 다시 마주하세요. 옛날 사진, 빛바랜 사진, 부모님 결혼식 사진, 그리고 그리운 반려동물 사진까지 AI로 생생하게 복원해 드립니다. 디지털 효도의 시작, ReVow Studio.",
  keywords: ["사진 복원", "디지털 효도", "빛바랜 사진 복구", "추억 재현", "반려동물 사진 복원", "옛날사진살리기", "부모님선물", "AI사진보정", "얼굴복원"],
  openGraph: {
    title: "ReVow Studio AI - 소중한 기억의 복원",
    description: "빛바랜 옛날 사진을 생생하게 복원하세요. 특별한 추억을 선물하는 디지털 효도.",
    type: "website",
    locale: "ko_KR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
