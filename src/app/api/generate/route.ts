export const runtime = 'nodejs';
export const maxDuration = 60;

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64, clothing, background, apiKey: byokKey } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: '이미지가 제공되지 않았습니다.' }, { status: 400 });
    }

    // Determine API Key
    const apiKey = byokKey || process.env.GEMINI_API_KEY;
    
    // MOCK MODE FOR DEVELOPMENT OR WHEN KEY IS MISSING (Cost saving)
    // If no key is provided and we are in test mode (or just to prevent errors when testing UI)
    if (!apiKey) {
      console.log('No API key provided. Using MOCK generation mode.');
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const MOCK_PREVIEWS: Record<string, string> = {
        'hanbok-hanok': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
        'wedding-studio': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        'suit-studio': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
        'gown-garden': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
      };
      
      const key = `${clothing}-${background}`;
      const mockResult = MOCK_PREVIEWS[key] || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800';
      
      return NextResponse.json({ 
        success: true, 
        imageBase64: mockResult, // For mock mode we return URL. UI can handle it. Wait, UI expects base64. 
        // We'll just return the URL and let UI handle it, but to match API specs, we should ideally return base64. 
        // We will send the URL instead and handle it in the frontend.
      });
    }

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
    
    // Construct dynamic instruction based on combinations
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

    return NextResponse.json({ 
      success: true, 
      imageBase64: `data:image/jpeg;base64,${generatedImageBase64}` 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
