import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const adminRouter = createTRPCRouter({
    getStats: adminProcedure.query(async ({ ctx }) => {
        const [totalOrders, totalRevenue, totalUsers, lowStockProducts] = await Promise.all([
            ctx.db.order.count(),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: "PAID" }
            }),
            ctx.db.user.count(),
            ctx.db.product.findMany({
                where: { quantity: { lte: 5 } },
                take: 5
            })
        ])

        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.total ?? 0,
            totalUsers,
            lowStockCount: lowStockProducts.length,
            lowStockProducts
        }
    }),

    getOrders: adminProcedure
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

    getProducts: adminProcedure
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
                    categories: true,
                }
            })
        }),

    updateOrderStatus: adminProcedure
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

    updateProductQuantity: adminProcedure
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

    getUsers: adminProcedure
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

    getCoupons: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.coupon.findMany({
            orderBy: { createdAt: "desc" }
        })
    }),

    createCoupon: adminProcedure
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

    deleteCoupon: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.coupon.delete({
                where: { id: input.id }
            })
        }),

    createCategory: adminProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            return ctx.db.category.create({
                data: {
                    name: input.name,
                    slug,
                    description: input.description,
                }
            })
        }),

    enhanceDescription: adminProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
            const { name, description } = input

            if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === "your-api-key-here") {
                return { enhanced: `[FALLBACK] ${name.toUpperCase()}\n\n${description}\n\n(Configure GOOGLE_AI_API_KEY for real AI enhancement.)` }
            }

            try {
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

                const prompt = `
                    You are a professional copywriter for a premium e-commerce streetwear brand called "FunkyStore". 
                    Enhance the following product description to be engaging, professional, and high-conversion.
                    
                    Product Name: ${name}
                    Original Notes: ${description}
                    
                    Return a structured description that includes:
                    1. A polished, bold opening statement about the lifestyle or aesthetic.
                    2. A paragraph about the fit/material quality.
                    3. A bulleted list of "Key Features" (use dashes -).
                    4. A short "Care Instructions" section.
                    
                    Keep the tone premium, edgy, and trendy. Do not use Markdown headers like # or ##.
                `

                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                return { enhanced: text.trim() }
            } catch (error) {
                console.error("Gemini AI Error:", error)
                throw new Error("AI enhancement failed. Check API key status.")
            }
        }),

    createProduct: adminProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            price: z.number().positive(),
            compareAtPrice: z.number().positive().optional(),
            quantity: z.number().int().min(0).default(0),
            sku: z.string().optional(),
            categoryIds: z.array(z.string()).optional(),
            imageUrls: z.array(z.string().url()).optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
            tags: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { name, description, price, compareAtPrice, quantity, sku, categoryIds, imageUrls, status, tags } = input
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

            // Auto-generate SKU if not provided
            const finalSku = sku || `FS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

            return ctx.db.product.create({
                data: {
                    name,
                    slug,
                    description,
                    price,
                    compareAtPrice,
                    quantity,
                    sku: finalSku,
                    status,
                    images: imageUrls && imageUrls.length > 0 ? {
                        create: imageUrls.map((url, index) => ({
                            url,
                            position: index
                        }))
                    } : undefined,
                    categories: categoryIds && categoryIds.length > 0 ? {
                        connect: categoryIds.map(id => ({ id }))
                    } : undefined,
                    tags: tags ? {
                        connectOrCreate: tags.split(",").map(tag => ({
                            where: { name: tag.trim() },
                            create: { name: tag.trim() }
                        }))
                    } : undefined
                }
            })
        }),
})
