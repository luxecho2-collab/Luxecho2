import { createTRPCRouter } from "@/server/api/trpc"
import { productRouter } from "@/server/api/routers/product"
import { checkoutRouter } from "@/server/api/routers/checkout"
import { accountRouter } from "@/server/api/routers/account"
import { adminRouter } from "@/server/api/routers/admin"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    product: productRouter,
    checkout: checkoutRouter,
    account: accountRouter,
    admin: adminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
