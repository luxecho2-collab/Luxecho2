import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { sendEmail } from "@/lib/email"
import { sendSMS } from "@/lib/sms"

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
                where: {
                    paymentStatus: "PAID",
                    status: { notIn: ["CANCELLED", "REFUNDED"] }
                }
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
                where: {
                    paymentStatus: "PAID",
                    createdAt: { gte: thirtyDaysAgo },
                    status: { notIn: ["CANCELLED", "REFUNDED"] }
                }
            }),
            ctx.db.order.aggregate({
                _sum: { total: true },
                where: {
                    paymentStatus: "PAID",
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                    status: { notIn: ["CANCELLED", "REFUNDED"] }
                }
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
            search: z.string().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const searchFilter = input.search ? {
                OR: [
                    { orderNumber: { contains: input.search, mode: 'insensitive' as const } },
                    { email: { contains: input.search, mode: 'insensitive' as const } },
                    { phone: { contains: input.search, mode: 'insensitive' as const } },
                    { trackingNumber: { contains: input.search, mode: 'insensitive' as const } },
                    { user: { name: { contains: input.search, mode: 'insensitive' as const } } },
                    { user: { email: { contains: input.search, mode: 'insensitive' as const } } },
                ]
            } : {}

            const dateFilter = input.startDate || input.endDate ? {
                createdAt: {
                    ...(input.startDate ? { gte: input.startDate } : {}),
                    ...(input.endDate ? { lte: input.endDate } : {}),
                }
            } : {}

            return ctx.db.order.findMany({
                where: {
                    paymentStatus: "PAID",
                    ...searchFilter,
                    ...dateFilter
                },
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    items: {
                        include: {
                            product: { select: { id: true, name: true } }
                        }
                    }
                }
            })
        }),

    getOrderDetails: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.order.findUnique({
                where: { id: input.id },
                include: {
                    user: { select: { name: true, email: true } },
                    items: {
                        include: {
                            product: { select: { id: true, name: true, images: true } },
                            variant: { select: { name: true, optionValues: { select: { value: true, option: { select: { name: true } } } } } }
                        }
                    }
                }
            })
        }),

    updateOrderStatus: adminProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "CANCEL_REQUESTED", "RETURN_REQUESTED", "REFUNDED"]),
            fulfillmentStatus: z.enum(["UNFULFILLED", "PARTIALLY_FULFILLED", "FULFILLED", "RESTOCKED"]).optional(),
            customMessage: z.string().optional(),
            notifyCustomer: z.boolean().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.db.order.update({
                where: { id: input.id },
                data: {
                    status: input.status,
                    fulfillmentStatus: input.fulfillmentStatus,
                    fulfilledAt: input.status === "DELIVERED" ? new Date() : undefined,
                    notes: input.customMessage ? input.customMessage : undefined,
                }
            })

            if (input.notifyCustomer) {
                // Send SMS if message provided and phone exists
                if (input.customMessage && (order.phone || (order.shippingAddress as any)?.phone)) {
                    const phone = order.phone || (order.shippingAddress as any)?.phone;
                    await sendSMS(phone, input.customMessage);
                }

                await sendEmail({
                    to: order.email,
                    subject: `Order Update - #${order.orderNumber}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #000; text-transform: uppercase; font-style: italic;">Order Update</h1>
                            <p>Your order status has been updated to: <strong>${input.status}</strong></p>
                            ${input.customMessage ? `
                                <div style="background: #fff; border-left: 4px solid #000; padding: 15px; margin: 20px 0; font-style: italic;">
                                    "${input.customMessage}"
                                </div>
                            ` : ''}
                            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-top: 20px;">
                                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                                <p><strong>Status:</strong> ${input.status}</p>
                            </div>
                            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                                You can track your order status in your account dashboard.
                            </p>
                        </div>
                    `
                })
            }

            return order
        }),

    updateOrderTracking: adminProcedure
        .input(z.object({
            id: z.string(),
            trackingNumber: z.string().optional(),
            trackingUrl: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.db.order.update({
                where: { id: input.id },
                data: {
                    trackingNumber: input.trackingNumber || null,
                    trackingUrl: input.trackingUrl || null,
                }
            })

            if (input.trackingNumber || input.trackingUrl) {
                await sendEmail({
                    to: order.email,
                    subject: `Shipping Details Added - #${order.orderNumber} `,
                    html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000; text-transform: uppercase; font-style: italic;">Shipping Update</h1>
            <p>We've added tracking information for your order.</p>
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-top: 20px;">
                <p><strong>Order Number: </strong> ${order.orderNumber}</p>
                ${input.trackingNumber ? `<p><strong>Tracking Number:</strong> ${input.trackingNumber}</p>` : ''}
                ${input.trackingUrl ? `<p><strong>Tracking Link:</strong> <a href="${input.trackingUrl}">Click here to track</a></p>` : ''}
            </div>
        </div>
        `
                })
            }

            return order
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
                where: { email: { not: null } }, // Should also consider isSubscribed check if it exists in schema
                select: { email: true, name: true }
            })

            let sentCount = 0
            for (const recipient of recipients) {
                if (recipient.email) {
                    await sendEmail({
                        to: recipient.email,
                        subject: input.subject,
                        html: `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000;">
        <h1 style="text-transform: uppercase; font-style: italic; border-bottom: 2px solid #000; padding-bottom: 10px;">LUXECHO</h1>
        <div style="padding: 20px 0; line-height: 1.6;">
            ${input.body.replace(/\n/g, '<br/>')}
            <br/><br/>
            offer of summer use cuopon code summer20
        </div>
        <footer style="border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px;">
            &copy; ${new Date().getFullYear()} Luxecho. All rights reserved.
        </footer>
    </div>
        `
                    })
                    sentCount++
                }
            }

            return { success: true, sentCount }
        }),

    exportOrders: adminProcedure
        .input(z.object({
            startDate: z.date().optional(),
            endDate: z.date().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const dateFilter = input.startDate || input.endDate ? {
                createdAt: {
                    ...(input.startDate ? { gte: input.startDate } : {}),
                    ...(input.endDate ? { lte: input.endDate } : {}),
                }
            } : {}

            const orders = await ctx.db.order.findMany({
                where: {
                    paymentStatus: "PAID",
                    ...dateFilter
                },
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    items: {
                        include: {
                            product: { select: { name: true } },
                            variant: { select: { name: true } }
                        }
                    }
                }
            })

            const csvHeader = [
                "Order ID", "Customer Name", "Customer Email", "Phone",
                "Order Status", "Payment Status", "Subtotal", "Tax",
                "Shipping", "Discount", "Total", "Items",
                "Shipping City", "Shipping Country", "Tracking Number", "Date"
            ].join(",")

            const csvRows = orders.map(order => {
                const shippingObj = order.shippingAddress as any
                const city = shippingObj?.city || ""
                const country = shippingObj?.country || ""

                const itemsStr = order.items.map(item =>
                    `${item.product.name}${item.variant?.name ? ` (${item.variant.name})` : ''} x${item.quantity}`
                ).join(" | ")

                return [
                    order.orderNumber,
                    `"${order.user?.name || 'Guest'}"`,
                    `"${order.email}"`,
                    `"${order.phone || shippingObj?.phone || ''}"`,
                    order.status,
                    order.paymentStatus,
                    order.subtotal.toFixed(2),
                    order.tax.toFixed(2),
                    order.shipping.toFixed(2),
                    order.discount.toFixed(2),
                    order.total.toFixed(2),
                    `"${itemsStr}"`,
                    `"${city}"`,
                    `"${country}"`,
                    `"${order.trackingNumber || ''}"`,
                    order.createdAt.toISOString(),
                ].join(",")
            })

            return [csvHeader, ...csvRows].join("\n")
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
            endDate: z.coerce.date().optional(),
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
                return { enhanced: `[FALLBACK] ${name.toUpperCase()} \n\n${description} \n\n(Configure GOOGLE_AI_API_KEY for real AI enhancement.)` }
            }

            try {
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

                const prompt = `
                    You are a professional copywriter for a premium e - commerce streetwear brand called "Luxecho". 
                    Enhance the following product description to be engaging, professional, and high - conversion.
                    
                    Product Name: ${name}
                    Original Notes: ${description}
                    
                    Return a structured description that includes:
1. A polished, bold opening statement about the lifestyle or aesthetic.
                    2. A paragraph about the fit / material quality.
                    3. A bulleted list of "Key Features"(use dashes -).
                    4. A short "Care Instructions" section.
                    
                    Keep the tone premium, edgy, and trendy.Do not use Markdown headers like # or ##.
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
            attributes: z.any().optional(),
            shippingReturns: z.string().optional(),
            additionalInfo: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { name, description, price, compareAtPrice, quantity, sku, categoryIds, imageUrls, status, tags, metaTitle, metaDescription, productInfo, attributes, shippingReturns, additionalInfo } = input
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
                    sizes: (input.sizes ?? []) as any,
                    metaTitle,
                    metaDescription,
                    productInfo,
                    attributes: attributes || [],
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

            // Notification for Active Product
            if (status === "ACTIVE") {
                const subscribers = await ctx.db.user.findMany({
                    where: { isSubscribed: true, email: { not: null } },
                    select: { email: true }
                })

                for (const sub of subscribers) {
                    if (sub.email) {
                        await sendEmail({
                            to: sub.email,
                            subject: `New Arrival: ${name} `,
                            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000;">
            <h1 style="text-transform: uppercase; font-style: italic;">New Arrival</h1>
            <p>Exclusively for our subscribers: <strong>${name}</strong> is now live.</p>
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-top: 20px;">
                <h3>${name}</h3>
                <p>Price: ₹${price.toLocaleString()}</p>
                <a href="${process.env.NEXTAUTH_URL}/products/${product.slug}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; text-transform: uppercase; font-weight: bold; font-size: 12px;">Shop Now</a>
            </div>
        </div>
                                    `
                        })
                    }
                }
            }

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
            attributes: z.any().optional(),
            shippingReturns: z.string().optional(),
            additionalInfo: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, name, description, price, compareAtPrice, quantity, sku, categoryIds, imageUrls, status, tags, metaTitle, metaDescription, productInfo, attributes, shippingReturns, additionalInfo } = input

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
                attributes: attributes !== undefined ? attributes : undefined,
                shippingReturns,
                additionalInfo,
            }

            if (name) {
                updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            }

            if (input.sizes !== undefined) {
                updateData.sizes = input.sizes as any
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

            const updated = await ctx.db.product.update({
                where: { id },
                data: updateData
            })

            // Notification if product becomes ACTIVE
            if (status === "ACTIVE") {
                const subscribers = await ctx.db.user.findMany({
                    where: { isSubscribed: true, email: { not: null } },
                    select: { email: true }
                })

                for (const sub of subscribers) {
                    if (sub.email) {
                        await sendEmail({
                            to: sub.email,
                            subject: `Back in Stock / New Drop: ${updated.name} `,
                            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #000;">
            <h1 style="text-transform: uppercase; font-style: italic;">New Drop</h1>
            <p>Our classic / new item <strong>${updated.name}</strong> is now available.</p>
            <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/products/${updated.slug}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; text-transform: uppercase; font-weight: bold; font-size: 12px;">View Product</a>
            </div>
        </div>
                            `
                        })
                    }
                }
            }

            return updated
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

    // ── Hero Slideshow ────────────────────────────────────────────────
    getHeroSlides: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.heroSlide.findMany({ orderBy: { order: "asc" } })
    }),

    createHeroSlide: adminProcedure
        .input(z.object({
            title: z.string().min(1),
            subtitle: z.string().min(1),
            ctaText: z.string().default("Explore Drop"),
            ctaLink: z.string().default("/products"),
            image: z.string().min(1),
            order: z.number().default(0),
            isActive: z.boolean().default(true),
            titleStyle: z.string().optional(),
            slideStyle: z.string().optional(),
            backgroundBlur: z.number().optional(),
            backgroundOpacity: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.heroSlide.create({ data: input })
        }),

    updateHeroSlide: adminProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().min(1).optional(),
            subtitle: z.string().min(1).optional(),
            ctaText: z.string().optional(),
            ctaLink: z.string().optional(),
            image: z.string().optional(),
            order: z.number().optional(),
            isActive: z.boolean().optional(),
            titleStyle: z.string().optional(),
            slideStyle: z.string().optional(),
            backgroundBlur: z.number().optional(),
            backgroundOpacity: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return ctx.db.heroSlide.update({ where: { id }, data })
        }),

    deleteHeroSlide: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.heroSlide.delete({ where: { id: input.id } })
        }),

    // ── Announcement Bar ──────────────────────────────────────────────
    getAnnouncements: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.announcement.findMany({ orderBy: { createdAt: "desc" } })
    }),

    createAnnouncement: adminProcedure
        .input(z.object({
            text: z.string().min(1),
            link: z.string().optional(),
            isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            // Deactivate others when creating an active one
            if (input.isActive) {
                await ctx.db.announcement.updateMany({ data: { isActive: false } })
            }
            return ctx.db.announcement.create({ data: input })
        }),

    updateAnnouncement: adminProcedure
        .input(z.object({
            id: z.string(),
            text: z.string().min(1).optional(),
            link: z.string().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            // If activating this, deactivate others
            if (data.isActive) {
                await ctx.db.announcement.updateMany({ where: { id: { not: id } }, data: { isActive: false } })
            }
            return ctx.db.announcement.update({ where: { id }, data })
        }),

    deleteAnnouncement: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.announcement.delete({ where: { id: input.id } })
        }),

    // ── Shipping Settings ─────────────────────────────────────────────
    getShippingSettings: adminProcedure.query(async ({ ctx }) => {
        const settings = await ctx.db.siteSettings.findMany({
            where: {
                key: {
                    in: [
                        "express_shipping_price", "express_shipping_label", "express_shipping_days",
                        "standard_shipping_price", "standard_shipping_label", "standard_shipping_days"
                    ]
                }
            }
        })
        const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
        return {
            expressPrice: parseFloat(map["express_shipping_price"] ?? "2000"),
            expressLabel: map["express_shipping_label"] ?? "Express Shipping",
            expressDays: map["express_shipping_days"] ?? "1–2 Business Days",
            standardPrice: parseFloat(map["standard_shipping_price"] ?? "0"),
            standardLabel: map["standard_shipping_label"] ?? "Standard Shipping",
            standardDays: map["standard_shipping_days"] ?? "3–7 Business Days",
        }
    }),

    updateShippingSettings: adminProcedure
        .input(z.object({
            expressPrice: z.number().min(0),
            expressLabel: z.string().min(1),
            expressDays: z.string().min(1),
            standardPrice: z.number().min(0),
            standardLabel: z.string().min(1),
            standardDays: z.string().min(1),
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.$transaction([
                ctx.db.siteSettings.upsert({
                    where: { key: "express_shipping_price" },
                    create: { key: "express_shipping_price", value: String(input.expressPrice) },
                    update: { value: String(input.expressPrice) },
                }),
                ctx.db.siteSettings.upsert({
                    where: { key: "express_shipping_label" },
                    create: { key: "express_shipping_label", value: input.expressLabel },
                    update: { value: input.expressLabel },
                }),
                ctx.db.siteSettings.upsert({
                    where: { key: "express_shipping_days" },
                    create: { key: "express_shipping_days", value: input.expressDays },
                    update: { value: input.expressDays },
                }),
                ctx.db.siteSettings.upsert({
                    where: { key: "standard_shipping_price" },
                    create: { key: "standard_shipping_price", value: String(input.standardPrice) },
                    update: { value: String(input.standardPrice) },
                }),
                ctx.db.siteSettings.upsert({
                    where: { key: "standard_shipping_label" },
                    create: { key: "standard_shipping_label", value: input.standardLabel },
                    update: { value: input.standardLabel },
                }),
                ctx.db.siteSettings.upsert({
                    where: { key: "standard_shipping_days" },
                    create: { key: "standard_shipping_days", value: input.standardDays },
                    update: { value: input.standardDays },
                }),
            ])
            return { success: true }
        }),
})
