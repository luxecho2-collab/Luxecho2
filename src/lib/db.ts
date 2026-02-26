import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Lazy initialization of Prisma Client to prevent build-time connection attempts
export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
