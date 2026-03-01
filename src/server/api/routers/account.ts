import { z } from "zod"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc"
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
            where: {
                userId: session.user.id,
                paymentStatus: { not: "PENDING" }
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                total: true,
                status: true,
                trackingNumber: true,
                trackingUrl: true,
                shippingAddress: true,
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        price: true,
                        options: true,
                        product: {
                            include: {
                                images: { take: 1 }
                            }
                        },
                        variant: true,
                    }
                }
            }
        })
    }),

    getWishlist: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.wishlistItem.findMany({
            where: { userId: ctx.session.user.id },
            include: {
                product: {
                    include: {
                        images: { take: 1 }
                    }
                }
            }
        })
    }),

    toggleWishlist: protectedProcedure
        .input(z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            options: z.record(z.string(), z.any()).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            const existing = await ctx.db.wishlistItem.findUnique({
                where: {
                    userId_productId: {
                        userId: userId,
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
                        userId: userId,
                        productId: input.productId,
                        variantId: input.variantId && input.variantId.length > 15 ? input.variantId : undefined,
                        options: input.options || undefined,
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

    updateAddress: publicProcedure
        .input(z.object({
            id: z.string(),
            street: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
            country: z.string().optional(),
            isDefault: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const session = await getServerSession(authOptions)
            if (!session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })

            const { id, ...data } = input

            if (data.isDefault) {
                await ctx.db.address.updateMany({
                    where: { userId: session.user.id },
                    data: { isDefault: false }
                })
            }

            return ctx.db.address.update({
                where: { id, userId: session.user.id },
                data
            })
        }),

    updateProfile: publicProcedure
        .input(z.object({
            name: z.string().optional(),
            image: z.string().optional(),
            phone: z.string().optional(),
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
