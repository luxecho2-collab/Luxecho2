import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const adminRouter = createTRPCRouter({
    getStats: adminProcedure.query(async ({ ctx }) => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

        const [
            totalOrders,
            totalRevenue,
            totalUsers,
            lowStockProducts,
            currentMonthOrders,
            previousMonthOrders,
            currentMonthRevenue,
            previousMonthRevenue,
            currentMonthUsers,
            previousMonthUsers
        ] = await Promise.all([
            ctx.db.order.count(),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: "PAID" }
            }),
            ctx.db.user.count(),
            ctx.db.product.findMany({
                where: { quantity: { lte: 5 } },
                take: 5
            }),
            // Growth Metrics
            ctx.db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            ctx.db.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } }
            }),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: "PAID", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
            }),
            ctx.db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            ctx.db.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
        ])

        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0
            return parseFloat(((current - previous) / previous * 100).toFixed(1))
        }

        return {
            totalOrders,
            totalRevenue: totalRevenue._sum.total ?? 0,
            totalUsers,
            lowStockCount: lowStockProducts.length,
            lowStockProducts,
            growth: {
                orders: calculateGrowth(currentMonthOrders, previousMonthOrders),
                revenue: calculateGrowth(currentMonthRevenue._sum.total ?? 0, previousMonthRevenue._sum.total ?? 0),
                users: calculateGrowth(currentMonthUsers, previousMonthUsers),
            }
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
            search: z.string().optional(),
            categoryId: z.string().optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
            lowStock: z.boolean().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const { search, skip, take, categoryId, minPrice, maxPrice, status, lowStock } = input

            const where: any = {}

            // Search Logic
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { metaTitle: { contains: search, mode: 'insensitive' } },
                    { metaDescription: { contains: search, mode: 'insensitive' } },
                    { productInfo: { contains: search, mode: 'insensitive' } },
                    {
                        tags: {
                            some: {
                                name: { contains: search, mode: 'insensitive' }
                            }
                        }
                    },
                    {
                        categories: {
                            some: {
                                name: { contains: search, mode: 'insensitive' }
                            }
                        }
                    }
                ]
            }

            // Category Filter
            if (categoryId) {
                where.categories = {
                    some: { id: categoryId }
                }
            }

            // Price Range Filter
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {}
                if (minPrice !== undefined) where.price.gte = minPrice
                if (maxPrice !== undefined) where.price.lte = maxPrice
            }

            // Status Filter
            if (status) {
                where.status = status
            }

            // Low Stock Filter
            if (lowStock) {
                where.quantity = { lte: 5 } // Using the default low stock alert threshold
            }

            return ctx.db.product.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    categories: true,
                    images: {
                        take: 1,
                        orderBy: { position: "asc" }
                    }
                }
            })
        }),
    getProductById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.product.findUnique({
                where: { id: input.id },
                include: {
                    images: { orderBy: { position: "asc" } },
                    categories: true,
                    tags: true,
                }
            })
        }),

    updateOrderStatus: adminProcedure
        .input(z.object({
            orderId: z.string(),
            status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
            notes: z.string().optional(),
            trackingNumber: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.order.update({
                where: { id: input.orderId },
                data: {
                    status: input.status as any,
                    notes: input.notes,
                    paymentMethod: input.trackingNumber ? `TRACKING:${input.trackingNumber}` : undefined // Simple way to store tracking if field not added
                }
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
            const users = await ctx.db.user.findMany({
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
                include: {
                    orders: {
                        where: { paymentStatus: "PAID" },
                        select: { id: true, total: true, status: true }
                    },
                }
            })

            return users.map(user => {
                const totalSpent = user.orders.reduce((sum, order) => sum + (order.total || 0), 0)
                return {
                    ...user,
                    totalSpent,
                    orderCount: user.orders.length,
                    isSubscriber: true // Placeholder for subscription logic
                }
            })
        }),

    getUserById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findUnique({
                where: { id: input.id },
                include: {
                    orders: {
                        orderBy: { createdAt: "desc" },
                        include: { items: { include: { product: true } } }
                    },
                    addresses: true,
                }
            })
        }),

    updateUserStatus: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.enum(["USER", "ADMIN"]).optional(),
            // Future-proofing for blocking: could add isBlocked to schema
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: input.userId },
                data: { role: input.role }
            })
        }),

    // Marketing Suite
    sendMarketingBlast: adminProcedure
        .input(z.object({
            subject: z.string().min(1),
            body: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            const recipients = await ctx.db.user.findMany({
                where: { email: { not: null } },
                select: { email: true, name: true }
            })

            // Mocking the bulk send for now since emailService is basic
            let sentCount = 0
            for (const recipient of recipients) {
                if (recipient.email) {
                    console.log(`[MARKETING_BLAST] To: ${recipient.email} | Subject: ${input.subject}`)
                    sentCount++
                }
            }

            return { success: true, sentCount }
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
                    You are a professional copywriter for a premium e-commerce streetwear brand called "Luxecho". 
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

    deleteProduct: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.product.delete({
                where: { id: input.id }
            })
        }),
    createProduct: adminProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string().min(1),
            price: z.number().positive(),
            compareAtPrice: z.number().positive().optional(),
            quantity: z.number().int().min(0),
            sku: z.string(),
            categoryIds: z.array(z.string()).optional(),
            imageUrls: z.array(z.string()).optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
            sizes: z.array(z.string()).optional(),
            tags: z.string().optional(),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
            productInfo: z.string().optional(),
            shippingReturns: z.string().optional(),
            additionalInfo: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { name, description, price, compareAtPrice, quantity, sku, categoryIds, imageUrls, status, tags, metaTitle, metaDescription, productInfo, shippingReturns, additionalInfo } = input
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

            const product = await ctx.db.product.create({
                data: {
                    name,
                    slug,
                    description,
                    price,
                    compareAtPrice,
                    quantity,
                    sku,
                    status,
                    sizes: (input.sizes as any) || [],
                    metaTitle,
                    metaDescription,
                    productInfo,
                    shippingReturns,
                    additionalInfo,
                    images: {
                        create: imageUrls?.map((url, index) => ({
                            url,
                            position: index
                        }))
                    },
                    categories: {
                        connect: categoryIds?.map(id => ({ id }))
                    },
                    tags: {
                        connectOrCreate: tags?.split(",").map(tag => ({
                            where: { name: tag.trim() },
                            create: { name: tag.trim() }
                        })) || []
                    }
                }
            })
            return product
        }),

    updateProduct: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            price: z.number().positive().optional(),
            compareAtPrice: z.number().positive().optional(),
            quantity: z.number().int().min(0).optional(),
            sku: z.string().optional(),
            categoryIds: z.array(z.string()).optional(),
            imageUrls: z.array(z.string()).optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
            sizes: z.array(z.string()).optional(),
            tags: z.string().optional(),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
            productInfo: z.string().optional(),
            shippingReturns: z.string().optional(),
            additionalInfo: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, name, description, price, compareAtPrice, quantity, sku, categoryIds, imageUrls, status, tags, metaTitle, metaDescription, productInfo, shippingReturns, additionalInfo } = input

            const updateData: any = {
                name,
                description,
                price,
                compareAtPrice,
                quantity,
                sku,
                status,
                metaTitle,
                metaDescription,
                productInfo,
                shippingReturns,
                additionalInfo,
            }

            if (name) {
                updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }

            if (input.sizes) {
                updateData.sizes = input.sizes
            }

            // Handle images
            if (imageUrls) {
                // Delete old images first (simplest approach for now)
                await ctx.db.image.deleteMany({ where: { productId: id } })
                updateData.images = {
                    create: imageUrls.map((url, index) => ({
                        url,
                        position: index
                    }))
                }
            }

            // Handle categories
            if (categoryIds) {
                updateData.categories = {
                    set: categoryIds.map(id => ({ id }))
                }
            }

            // Handle tags
            if (tags !== undefined) {
                updateData.tags = {
                    set: [], // Clear existing relations
                    connectOrCreate: tags.split(",").map(tag => ({
                        where: { name: tag.trim() },
                        create: { name: tag.trim() }
                    }))
                }
            }

            return ctx.db.product.update({
                where: { id },
                data: updateData
            })
        }),

    updateCategory: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, name, description } = input
            const data: any = { description }
            if (name) {
                data.name = name
                data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }
            return ctx.db.category.update({
                where: { id },
                data
            })
        }),

    deleteCategory: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.category.delete({
                where: { id: input.id }
            })
        }),

    getCategories: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.category.findMany({
            orderBy: { name: "asc" }
        })
    }),

    // Attribute Management for Advanced Filters
    getAttributes: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.tag.findMany({ select: { id: true, name: true } })
    }),

    createTag: adminProcedure
        .input(z.object({ name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.tag.create({
                data: { name: input.name }
            })
        }),

    updateTag: adminProcedure
        .input(z.object({ id: z.string(), name: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.tag.update({
                where: { id: input.id },
                data: { name: input.name }
            })
        }),

    deleteTag: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.tag.delete({
                where: { id: input.id }
            })
        }),
})
