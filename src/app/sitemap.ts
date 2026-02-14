import { type MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://funkystore.io'

    // Get all products
    const products = await db.product.findMany({
        where: { status: 'ACTIVE' },
        select: { slug: true, updatedAt: true }
    })

    // Get all categories
    const categories = await db.category.findMany({
        select: { slug: true, updatedAt: true }
    })

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/products?categoryId=${category.slug}`, // Or however your filtered URL looks
        lastModified: category.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...productRoutes,
        ...categoryRoutes,
    ]
}
