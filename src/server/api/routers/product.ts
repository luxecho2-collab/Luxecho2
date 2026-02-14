import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { ProductStatus } from "@prisma/client"

export const productRouter = createTRPCRouter({
    getFeatured: publicProcedure.query(({ ctx }) => {
        return ctx.db.product.findMany({
            where: {
                status: ProductStatus.ACTIVE,
            },
            take: 8,
            include: {
                images: {
                    orderBy: {
                        position: "asc",
                    },
                },
                category: true,
            },
        })
    }),
    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.product.findUnique({
                where: { slug: input.slug },
                include: {
                    images: {
                        orderBy: {
                            position: "asc",
                        },
                    },
                    category: true,
                    options: {
                        include: {
                            values: true,
                        },
                    },
                    variants: {
                        include: {
                            optionValues: {
                                include: {
                                    option: true,
                                }
                            },
                        }
                    },
                },
            })
        }),
    getRelated: publicProcedure
        .input(z.object({
            slug: z.string(),
            categoryId: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.db.product.findMany({
                where: {
                    categoryId: input.categoryId,
                    NOT: {
                        slug: input.slug,
                    },
                    status: ProductStatus.ACTIVE,
                },
                take: 4,
                include: {
                    images: {
                        orderBy: {
                            position: "asc",
                        },
                    },
                    category: true,
                },
            })
        }),

    list: publicProcedure
        .input(z.object({
            categoryId: z.string().optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            search: z.string().optional(),
            sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
            skip: z.number().default(0),
            take: z.number().default(12),
        }))
        .query(async ({ ctx, input }) => {
            const { categoryId, minPrice, maxPrice, search, sort, skip, take } = input

            const where: any = {
                status: ProductStatus.ACTIVE,
            }

            if (categoryId) {
                where.categoryId = categoryId
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {}
                if (minPrice !== undefined) where.price.gte = minPrice
                if (maxPrice !== undefined) where.price.lte = maxPrice
            }

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ]
            }

            const orderBy: any = {}
            if (sort === "newest") {
                orderBy.createdAt = "desc"
            } else if (sort === "price_asc") {
                orderBy.price = "asc"
            } else if (sort === "price_desc") {
                orderBy.price = "desc"
            }

            const [items, total] = await Promise.all([
                ctx.db.product.findMany({
                    where,
                    orderBy,
                    skip,
                    take,
                    include: {
                        images: {
                            orderBy: { position: "asc" },
                        },
                        category: true,
                        options: { include: { values: true } },
                    },
                }),
                ctx.db.product.count({ where }),
            ])

            return { items, total }
        }),

    getCategories: publicProcedure.query(({ ctx }) => {
        return ctx.db.category.findMany({
            orderBy: { name: "asc" }
        })
    }),
})
