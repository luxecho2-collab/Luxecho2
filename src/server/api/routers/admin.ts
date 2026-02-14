import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/server/auth"
import { Role } from "@prisma/client"

export const adminRouter = createTRPCRouter({
    getStats: publicProcedure.query(async ({ ctx }) => {
        const session = await getServerSession(authOptions)
        // Check for admin role if needed

        const [totalOrders, totalRevenue, totalUsers, lowStockProducts] = await Promise.all([
            ctx.db.order.count(),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: "PAID" }
            }),
            ctx.db.user.count(),
            ctx.db.product.count({
                where: { quantity: { lte: 5 } }
            })
        ])

        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.total ?? 0,
            totalUsers,
            lowStockProducts
        }
    }),

    getOrders: publicProcedure
        .input(z.object({
            skip: z.number().default(0),
            take: z.number().default(50),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.order.findMany({
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
                include: {
                    user: true,
                }
            })
        }),

    getProducts: publicProcedure
        .input(z.object({
            skip: z.number().default(0),
            take: z.number().default(50),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.product.findMany({
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
                include: {
                    category: true,
                }
            })
        }),

    updateOrderStatus: publicProcedure
        .input(z.object({
            orderId: z.string(),
            status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.order.update({
                where: { id: input.orderId },
                data: { status: input.status as any }
            })
        }),

    updateProductQuantity: publicProcedure
        .input(z.object({
            productId: z.string(),
            quantity: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.product.update({
                where: { id: input.productId },
                data: { quantity: input.quantity }
            })
        }),

    getUsers: publicProcedure
        .input(z.object({
            skip: z.number().default(0),
            take: z.number().default(50),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findMany({
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
                include: {
                    orders: { select: { id: true } },
                }
            })
        }),

    getCoupons: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.coupon.findMany({
            orderBy: { createdAt: "desc" }
        })
    }),

    createCoupon: publicProcedure
        .input(z.object({
            code: z.string().min(3),
            description: z.string().optional(),
            discountType: z.enum(["PERCENTAGE", "FIXED"]),
            discountValue: z.number().positive(),
            minOrderAmount: z.number().optional(),
            usageLimit: z.number().optional(),
            endDate: z.date().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.coupon.create({
                data: {
                    ...input,
                    code: input.code.toUpperCase(),
                }
            })
        }),

    deleteCoupon: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.coupon.delete({
                where: { id: input.id }
            })
        }),
})
