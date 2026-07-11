import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Crown, MessageCircleHeart, Heart, ArrowLeft } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return { title: '사연을 찾을 수 없습니다' };

  const story = await prisma.story.findUnique({
    where: { id }
  });

  if (!story) return { title: '사연을 찾을 수 없습니다' };

  return {
    title: `${story.title} - ReVow Studio AI`,
    description: story.content.slice(0, 150) + (story.content.length > 150 ? '...' : ''),
    openGraph: {
      title: story.title,
      description: story.content.slice(0, 150),
      images: [story.afterImg],
    }
  }
}

export default async function StoryPage({ params }: Props) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const story = await prisma.story.findUnique({
    where: { id }
  });

  if (!story) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-soft relative overflow-hidden h-max">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-foreground/50 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} /> 홈으로 돌아가기
        </Link>
        
        {story.isCuration && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary mb-3 bg-primary/10 w-max px-2 py-1 rounded-full">
            <Crown size={12} /> 이번 주의 따뜻한 기억
          </div>
        )}
        
        <h1 className="text-xl font-black text-foreground mb-6 leading-snug">
          {story.title}
        </h1>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden grayscale opacity-80 border-4 border-background shadow-sm">
            <Image src={story.beforeImg} alt={`복원 전 옛날 사진 - ${story.title}`} fill className="object-cover" />
            <span className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">Before (원본)</span>
          </div>
          <div className="flex items-center justify-center text-foreground/30"><ArrowRight size={20}/></div>
          <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden border-4 border-primary/20 shadow-md">
            <Image src={story.afterImg} alt={`AI로 복원된 사진 - ${story.title}`} fill className="object-cover" />
            <span className="absolute top-3 right-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">After ✨</span>
          </div>
        </div>
        
        <p className="text-sm leading-relaxed text-foreground/90 font-medium mb-6 whitespace-pre-wrap bg-background p-4 rounded-xl border border-primary/10">
          "{story.content}"
        </p>
        
        <div className="flex justify-between items-center pt-4 border-t border-background">
          <span className="text-sm font-bold text-foreground/50">작성자: {story.author}</span>
          <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Heart size={16} className="fill-primary text-primary" />
            따뜻해요 {story.likes}
          </div>
        </div>
      </div>
    </div>
  );
}
