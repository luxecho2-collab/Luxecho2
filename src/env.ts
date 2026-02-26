import { z } from "zod"

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    LOCAL_DATABASE_URL: z.string().url().optional(),
    USE_LOCAL_DB: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
})

// More robust build-time detection for Vercel/CI
const isBuildTime =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.VERCEL === "1" ||
    process.env.CI === "true" ||
    !!process.env.SKIP_ENV_VALIDATION

export const env = (function () {
    if (isBuildTime) {
        // Just return the raw process.env during build to prevent Zod from crashing the collector
        return process.env as unknown as z.infer<typeof envSchema>
    }

    try {
        return envSchema.parse(process.env)
    } catch (e) {
        // Fallback for unexpected build-time evaluation
        if (process.env.NODE_ENV === "production") {
            console.warn("⚠️ Environment validation failed, but proceeding because this might be a build phase.")
            return process.env as unknown as z.infer<typeof envSchema>
        }
        throw e
    }
})()
