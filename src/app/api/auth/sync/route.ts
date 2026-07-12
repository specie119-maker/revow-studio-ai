import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { firebaseUid, email } = await req.json();

    if (!firebaseUid) {
      return NextResponse.json({ error: 'firebaseUid is required' }, { status: 400 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: {
        email: email || undefined, // Update email if provided
      },
      create: {
        firebaseUid,
        email: email || null,
        tokens: 0, // No free tokens for now
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Auth Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
