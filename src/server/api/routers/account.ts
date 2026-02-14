import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/server/auth"

export const accountRouter = createTRPCRouter({
    getProfile: publicProcedure.query(async ({ ctx }) => {
        const session = await getServerSession(authOptions)
        if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

        return ctx.db.user.findUnique({
            where: { id: session.user.id },
            include: {
                addresses: true,
            }
        })
    }),

    getOrders: publicProcedure.query(async ({ ctx }) => {
        const session = await getServerSession(authOptions)
        if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

        return ctx.db.order.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: { take: 1 }
                            }
                        }
                    }
                }
            }
        })
    }),

    getWishlist: publicProcedure.query(async ({ ctx }) => {
        const session = await getServerSession(authOptions)
        if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

        return ctx.db.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        images: { take: 1 }
                    }
                }
            }
        })
    }),

    toggleWishlist: publicProcedure
        .input(z.object({ productId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const session = await getServerSession(authOptions)
            if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

            const existing = await ctx.db.wishlistItem.findUnique({
                where: {
                    userId_productId: {
                        userId: session.user.id,
                        productId: input.productId,
                    }
                }
            })

            if (existing) {
                await ctx.db.wishlistItem.delete({
                    where: { id: existing.id }
                })
                return { added: false }
            } else {
                await ctx.db.wishlistItem.create({
                    data: {
                        userId: session.user.id,
                        productId: input.productId,
                    }
                })
                return { added: true }
            }
        }),

    getAddresses: publicProcedure.query(async ({ ctx }) => {
        const session = await getServerSession(authOptions)
        if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

        return ctx.db.address.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        })
    }),

    createAddress: publicProcedure
        .input(z.object({
            street: z.string(),
            city: z.string(),
            state: z.string(),
            zip: z.string(),
            country: z.string(),
            isDefault: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const session = await getServerSession(authOptions)
            if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

            if (input.isDefault) {
                await ctx.db.address.updateMany({
                    where: { userId: session.user.id },
                    data: { isDefault: false }
                })
            }

            return ctx.db.address.create({
                data: {
                    ...input,
                    userId: session.user.id,
                }
            })
        }),

    deleteAddress: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const session = await getServerSession(authOptions)
            if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

            return ctx.db.address.delete({
                where: { id: input.id, userId: session.user.id }
            })
        }),

    updateProfile: publicProcedure
        .input(z.object({
            name: z.string().optional(),
            image: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const session = await getServerSession(authOptions)
            if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

            return ctx.db.user.update({
                where: { id: session.user.id },
                data: input,
            })
        }),
})
