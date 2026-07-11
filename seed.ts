import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.story.createMany({
    data: [
      {
        author: '따뜻한딸',
        content: '50년 전 형편이 어려워 사진 한 장 못 남기신 부모님. 이번에 AI로 한복 입은 모습을 보여드렸더니 눈물을 글썽이셨어요. 정말 감사합니다.',
        beforeImg: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        afterImg: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
        likes: 124,
        isCuration: true
      },
      {
        author: '강아지별',
        content: '먼저 무지개다리를 건넌 우리 뽀삐. 옛날 폰으로 찍어 흐릿했던 사진을 이렇게 생생하게 복원해주셔서 마음이 따뜻해졌습니다.',
        beforeImg: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
        afterImg: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=400',
        likes: 89,
        isCuration: false
      }
    ]
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
