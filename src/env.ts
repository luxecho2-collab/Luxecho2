import { z } from "zod"

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    LOCAL_DATABASE_URL: z.string().url().optional(),
    USE_LOCAL_DB: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

// Skip validation during build for Vercel/CI
const skipValidation = process.env.SKIP_ENV_VALIDATION === "true" || process.env.NEXT_PHASE === "phase-production-build"

export const env = skipValidation
    ? (process.env as unknown as z.infer<typeof envSchema>)
    : envSchema.parse(process.env)
