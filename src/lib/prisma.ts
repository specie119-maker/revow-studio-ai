import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db"
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      // Lazy load to prevent build-time crashes in Next.js
      globalForPrisma.prisma = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
      } as any)
    }
    return (globalForPrisma.prisma as any)[prop]
  }
})
