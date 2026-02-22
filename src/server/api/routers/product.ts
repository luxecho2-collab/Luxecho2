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
                categories: true,
                images: {
                    orderBy: {
                        position: "asc",
                    },
                },
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
                    categories: true,
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
                    categories: {
                        some: {
                            id: input.categoryId
                        }
                    },
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
                    categories: true,
                },
            })
        }),

    list: publicProcedure
        .input(z.object({
            categoryId: z.string().optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            search: z.string().optional(),
            options: z.record(z.string(), z.array(z.string())).optional(),
            sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
            skip: z.number().default(0),
            take: z.number().default(12),
        }))
        .query(async ({ ctx, input }) => {
            const { categoryId, minPrice, maxPrice, search, options, sort, skip, take } = input

            const where: any = {
                status: ProductStatus.ACTIVE,
            }

            if (categoryId) {
                where.categories = {
                    some: {
                        id: categoryId
                    }
                }
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
                    { sku: { contains: search, mode: "insensitive" } },
                    { metaTitle: { contains: search, mode: "insensitive" } },
                    { metaDescription: { contains: search, mode: "insensitive" } },
                    { productInfo: { contains: search, mode: "insensitive" } },
                    {
                        tags: {
                            some: {
                                name: { contains: search, mode: "insensitive" }
                            }
                        }
                    },
                    {
                        categories: {
                            some: {
                                name: { contains: search, mode: "insensitive" }
                            }
                        }
                    }
                ]
            }

            if (options) {
                const optionEntries = Object.entries(options as Record<string, string[]>).filter(([_, values]) => values && values.length > 0)
                if (optionEntries.length > 0) {
                    where.AND = optionEntries.map(([name, values]) => ({
                        options: {
                            some: {
                                name,
                                values: {
                                    some: {
                                        value: { in: values }
                                    }
                                }
                            }
                        }
                    }))
                }
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
                        categories: true,
                        options: { include: { values: true } },
                    },
                }),
                ctx.db.product.count({ where }),
            ])

            return { items, total }
        }),

    getFilters: publicProcedure.query(async ({ ctx }) => {
        const options = await ctx.db.productOption.findMany({
            include: {
                values: true,
            },
        })

        const filters: Record<string, string[]> = {}
        options.forEach(opt => {
            if (!filters[opt.name]) {
                filters[opt.name] = []
            }
            opt.values.forEach(val => {
                if (!filters[opt.name].includes(val.value)) {
                    filters[opt.name].push(val.value)
                }
            })
        })

        return filters
    }),

    getCategories: publicProcedure.query(({ ctx }) => {
        return ctx.db.category.findMany({
            orderBy: { name: "asc" }
        })
    }),
    incrementViewCount: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.product.update({
                where: { id: input.id },
                data: { viewCount: { increment: 1 } }
            })
        }),
    incrementAddToCartCount: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.product.update({
                where: { id: input.id },
                data: { addToCartCount: { increment: 1 } }
            })
        }),
})
