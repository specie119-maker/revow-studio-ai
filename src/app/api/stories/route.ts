import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, stories });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, author, content, beforeImg, afterImg } = body;

    if (!content || !beforeImg || !afterImg) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        title: title || '나만의 따뜻한 기억',
        author: author || '익명의 사용자',
        content,
        beforeImg,
        afterImg,
        likes: 0,
        isCuration: false,
      }
    });

    return NextResponse.json({ success: true, story });
  } catch (error: any) {
    console.error('Error creating story:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
