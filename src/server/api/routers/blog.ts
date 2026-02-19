import { z } from "zod"
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc"
import { nanoid } from "nanoid"

export const blogRouter = createTRPCRouter({
    // Public Procedures
    list: publicProcedure
        .input(z.object({
            skip: z.number().default(0),
            take: z.number().default(10),
        }))
        .query(async ({ ctx, input }) => {
            const [items, total] = await Promise.all([
                ctx.db.blogPost.findMany({
                    where: { status: "ACTIVE" },
                    skip: input.skip,
                    take: input.take,
                    orderBy: { publishedAt: "desc" },
                }),
                ctx.db.blogPost.count({ where: { status: "ACTIVE" } }),
            ])
            return { items, total }
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.db.blogPost.findUnique({
                where: { slug: input.slug },
            })

            if (post?.status === "ACTIVE") {
                // Increment view count
                await ctx.db.blogPost.update({
                    where: { id: post.id },
                    data: { viewCount: { increment: 1 } },
                })
            }

            return post
        }),

    getPostById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.blogPost.findUnique({
                where: { id: input.id },
            })
        }),

    // Admin Procedures
    getAdminPosts: adminProcedure
        .input(z.object({
            skip: z.number().default(0),
            take: z.number().default(50),
        }))
        .query(async ({ ctx, input }) => {
            return ctx.db.blogPost.findMany({
                skip: input.skip,
                take: input.take,
                orderBy: { createdAt: "desc" },
            })
        }),

    createPost: adminProcedure
        .input(z.object({
            title: z.string().min(1),
            content: z.string().min(1),
            excerpt: z.string().optional(),
            featuredImage: z.string().optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(4)}`

            // Simple reading time calc (words / 200)
            const words = input.content.split(/\s+/).length
            const readingTime = Math.max(1, Math.ceil(words / 200))

            return ctx.db.blogPost.create({
                data: {
                    ...input,
                    slug,
                    readingTime,
                    publishedAt: input.status === "ACTIVE" ? new Date() : null,
                }
            })
        }),

    updatePost: adminProcedure
        .input(z.object({
            id: z.string(),
            title: z.string().optional(),
            content: z.string().optional(),
            excerpt: z.string().optional(),
            featuredImage: z.string().optional(),
            status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            const updateData: any = { ...data }

            if (data.title) {
                updateData.slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(4)}`
            }

            if (data.content) {
                const words = data.content.split(/\s+/).length
                updateData.readingTime = Math.max(1, Math.ceil(words / 200))
            }

            if (data.status === "ACTIVE") {
                const current = await ctx.db.blogPost.findUnique({ where: { id } })
                if (!current?.publishedAt) {
                    updateData.publishedAt = new Date()
                }
            }

            return ctx.db.blogPost.update({
                where: { id },
                data: updateData,
            })
        }),

    deletePost: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.blogPost.delete({
                where: { id: input.id },
            })
        }),
})
