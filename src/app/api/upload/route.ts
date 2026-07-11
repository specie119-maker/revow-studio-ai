import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    let buffer: Buffer;
    let finalFilename: string;

    if (data.has('base64')) {
      const b64 = data.get('base64') as string;
      const base64Data = b64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, 'base64');
      finalFilename = `generated-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    } else {
      const file: File | null = data.get('file') as unknown as File;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file or base64 uploaded' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      finalFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    }

    // With Next.js, saving to public/uploads allows serving the image directly
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const path = join(uploadDir, finalFilename);

    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);

    return NextResponse.json({ success: true, url: `/uploads/${finalFilename}` });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
