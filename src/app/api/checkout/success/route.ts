import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { firebaseUid, planId } = await req.json();

    if (!firebaseUid || !planId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Determine how many tokens to add based on planId
    let tokensToAdd = 0;
    if (planId === 'pack_5') tokensToAdd = 5;
    else if (planId === 'pack_20') tokensToAdd = 20;
    else if (planId === 'pack_60') tokensToAdd = 60;
    
    if (tokensToAdd === 0) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { firebaseUid },
      data: {
        tokens: {
          increment: tokensToAdd,
        },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Checkout Success Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
