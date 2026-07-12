export const runtime = 'nodejs';
export const maxDuration = 60;

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { imageBase64, clothing, background, firebaseUid } = await req.json();

    if (!firebaseUid) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    if (!imageBase64) {
      return NextResponse.json({ error: '이미지가 제공되지 않았습니다.' }, { status: 400 });
    }

    // Check user tokens
    const user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user || user.tokens <= 0) {
      return NextResponse.json({ error: '사용 가능한 토큰이 없습니다. 요금제 결제가 필요합니다.' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let finalImage = '';
    
    // MOCK MODE FOR DEVELOPMENT OR WHEN KEY IS MISSING
    if (!apiKey) {
      console.log('No API key provided. Using MOCK generation mode.');
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const MOCK_PREVIEWS: Record<string, string> = {
        'hanbok-hanok': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
        'wedding-studio': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        'suit-studio': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
        'gown-garden': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
      };
      
      const key = `${clothing}-${background}`;
      finalImage = MOCK_PREVIEWS[key] || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800';
    } else {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: '유효하지 않은 이미지 형식입니다.' }, { status: 400 });
      }
      const mimeType = matches[1];
      const base64Data = matches[2];

      const sizeInBytes = Buffer.byteLength(base64Data, 'base64');
      if (sizeInBytes > 8 * 1024 * 1024) {
        return NextResponse.json({ error: '이미지 용량이 너무 큽니다. (최대 8MB)' }, { status: 413 });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const clothingMap: Record<string, string> = {
        'hanbok': 'traditional Korean Hanbok attire',
        'wedding': 'elegant western wedding dress and tuxedo',
        'suit': 'modern stylish formal suit and dress',
        'gown': 'graduation gown with academic cap',
      };
      
      const bgMap: Record<string, string> = {
        'hanok': 'traditional Korean Hanok architecture with wooden elements',
        'studio': 'clean, bright modern indoor photography studio',
        'garden': 'lush outdoor garden with beautiful natural lighting and flowers',
        'church': 'grand cathedral with stained glass and high ceilings',
      };
      
      const targetClothing = clothingMap[clothing] || clothingMap['wedding'];
      const targetBg = bgMap[background] || bgMap['studio'];
      
      const instruction = `Restore and transform this photo. Keep the main subjects (the people), their facial features, and the camera perspective EXACTLY the same. Dress them in ${targetClothing}. Change the environment and background to a ${targetBg}. The final image should be photorealistic photography with emotional, natural lighting and high detail. Do not change the identities of the people.`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: instruction }
        ]}],
      });

      const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      const generatedImageBase64 = part?.inlineData?.data;

      if (!generatedImageBase64) {
        return NextResponse.json({ error: '이미지 생성에 실패했거나 차단되었습니다.' }, { status: 500 });
      }
      finalImage = `data:image/jpeg;base64,${generatedImageBase64}`;
    }

    // Deduct token
    const updatedUser = await prisma.user.update({
      where: { firebaseUid },
      data: { tokens: { decrement: 1 } },
    });

    return NextResponse.json({ 
      success: true, 
      imageBase64: finalImage,
      remainingTokens: updatedUser.tokens
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
