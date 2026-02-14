import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import { type AppRouter } from "@/server/api/root"
import superjson from "superjson"

export const api = createTRPCReact<AppRouter>()

function getBaseUrl() {
    if (typeof window !== "undefined") return "" // Browser should use relative path
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpcClient = api.createClient({
    links: [
        httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
        }),
    ],
})
