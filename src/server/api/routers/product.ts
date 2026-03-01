import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { ProductStatus } from "@prisma/client"

export const productRouter = createTRPCRouter({
    // Relevance-ranked search — exact name > name contains > description/tag contains
    search: publicProcedure
        .input(z.object({ query: z.string().min(2), take: z.number().default(12) }))
        .query(async ({ ctx, input }) => {
            const { query, take } = input
            const q = query.trim()

            const [exactName, containsName, rest] = await Promise.all([
                // 1. Exact product name match
                ctx.db.product.findMany({
                    where: { status: ProductStatus.ACTIVE, name: { equals: q } },
                    take,
                    include: { images: { orderBy: { position: "asc" }, take: 1 }, categories: true },
                }),
                // 2. Name contains (but not exact)
                ctx.db.product.findMany({
                    where: {
                        status: ProductStatus.ACTIVE,
                        name: { contains: q },
                        NOT: { name: { equals: q } },
                    },
                    take,
                    orderBy: { salesCount: "desc" },
                    include: { images: { orderBy: { position: "asc" }, take: 1 }, categories: true },
                }),
                // 3. Description / tags / category / meta (not already matched by name)
                ctx.db.product.findMany({
                    where: {
                        status: ProductStatus.ACTIVE,
                        NOT: { name: { contains: q } },
                        OR: [
                            { description: { contains: q } },
                            { metaTitle: { contains: q } },
                            { productInfo: { contains: q } },
                            { tags: { some: { name: { contains: q } } } },
                            { categories: { some: { name: { contains: q } } } },
                        ],
                    },
                    take,
                    orderBy: { salesCount: "desc" },
                    include: { images: { orderBy: { position: "asc" }, take: 1 }, categories: true },
                }),
            ])

            // Deduplicate preserving rank order
            const seen = new Set<string>()
            const results = [...exactName, ...containsName, ...rest].filter(p => {
                if (seen.has(p.id)) return false
                seen.add(p.id)
                return true
            })

            return results.slice(0, take)
        }),

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
                    { name: { contains: search } },
                    { description: { contains: search } },
                    { sku: { contains: search } },
                    { metaTitle: { contains: search } },
                    { metaDescription: { contains: search } },
                    { productInfo: { contains: search } },
                    { tags: { some: { name: { contains: search } } } },
                    { categories: { some: { name: { contains: search } } } },
                ]
            }

            if (options) {
                const optionEntries = Object.entries(options as Record<string, string[]>).filter(([_, values]) => values && values.length > 0)
                if (optionEntries.length > 0) {
                    where.AND = optionEntries.map(([name, values]) => {
                        if (name === "Size") {
                            // Match via ProductOption variants OR via the JSON sizes field
                            return {
                                OR: [
                                    {
                                        options: {
                                            some: {
                                                name,
                                                values: { some: { value: { in: values } } }
                                            }
                                        }
                                    },
                                    // JSON array_contains — matches products using the simple sizes field
                                    { OR: values.map(size => ({ sizes: { array_contains: size } })) }
                                ]
                            }
                        }
                        return {
                            options: {
                                some: {
                                    name,
                                    values: { some: { value: { in: values } } }
                                }
                            }
                        }
                    })
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
        const [options, productsWithSizes] = await Promise.all([
            ctx.db.productOption.findMany({
                include: { values: true },
            }),
            ctx.db.product.findMany({
                where: { status: ProductStatus.ACTIVE },
                select: { sizes: true },
            }),
        ])

        const filters: Record<string, string[]> = {}

        // Collect sizes from ProductOption (variants system)
        options.forEach(opt => {
            if (!filters[opt.name]) filters[opt.name] = []
            opt.values.forEach(val => {
                if (!filters[opt.name]!.includes(val.value)) {
                    filters[opt.name]!.push(val.value)
                }
            })
        })

        // Collect sizes from the JSON `sizes` field and merge under "Size"
        const jsonSizeSet = new Set<string>()
        productsWithSizes.forEach(p => {
            if (Array.isArray(p.sizes)) {
                (p.sizes as string[]).forEach(s => {
                    if (s && typeof s === "string") jsonSizeSet.add(s.trim())
                })
            }
        })

        if (jsonSizeSet.size > 0) {
            const existing = filters["Size"] ?? []
            const merged = [...new Set([...existing, ...jsonSizeSet])]
            filters["Size"] = merged
        }

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
