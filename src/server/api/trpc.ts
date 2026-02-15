import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/server/auth"
import { TRPCError } from "@trpc/server"

import { db } from "@/lib/db"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await getServerSession(authOptions)

    return {
        db,
        session,
        headers: opts.headers,
    }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape }) {
        return shape
    },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

/**
 * Protected procedure (authenticated)
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    return next({
        ctx: {
            session: { ...ctx.session, user: ctx.session.user },
        },
    })
})

/**
 * Admin procedure (authenticated + admin role)
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.session.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" })
    }
    return next()
})
