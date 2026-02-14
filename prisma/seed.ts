import { PrismaClient, ProductStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("Seeding database...")

    // Create Categories
    const neonEssentials = await prisma.category.upsert({
        where: { slug: "neon-essentials" },
        update: {},
        create: {
            name: "Neon Essentials",
            slug: "neon-essentials",
            description: "High-visibility garments with neon accents.",
            image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        },
    })

    const cyberStreetwear = await prisma.category.upsert({
        where: { slug: "cyber-streetwear" },
        update: {},
        create: {
            name: "Cyber Streetwear",
            slug: "cyber-streetwear",
            description: "Futuristic designs for the urban explorer.",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
        },
    })

    const minimalistBasics = await prisma.category.upsert({
        where: { slug: "minimalist-basics" },
        update: {},
        create: {
            name: "Minimalist Basics",
            slug: "minimalist-basics",
            description: "Essential pieces for a clean, modern look.",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1920&auto=format&fit=crop",
        },
    })

    // Create Products
    const cyberHoodie = await prisma.product.create({
        data: {
            name: "Cyber Neon Hoodie",
            slug: "cyber-neon-hoodie",
            description: "A premium oversized hoodie with neon green accents and cyber-inspired graphics. Perfect for late-night urban exploration.",
            price: 120.00,
            compareAtPrice: 150.00,
            sku: "CH-001",
            status: ProductStatus.ACTIVE,
            categoryId: cyberStreetwear.id,
            metaTitle: "Cyber Neon Hoodie | Ultimate E-Commerce",
            metaDescription: "The futuristic cyber neon hoodie for your urban adventures.",
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop", alt: "Cyber Neon Hoodie Front", position: 0 },
                    { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop", alt: "Cyber Neon Hoodie Detail", position: 1 },
                ]
            },
            options: {
                create: [
                    {
                        name: "Size",
                        values: {
                            create: [
                                { value: "S" },
                                { value: "M" },
                                { value: "L" },
                                { value: "XL" },
                            ]
                        }
                    },
                    {
                        name: "Color",
                        values: {
                            create: [
                                { value: "Neon Green" },
                                { value: "Cyber Blue" },
                            ]
                        }
                    }
                ]
            },
            tags: {
                create: [
                    { name: "Neon" },
                    { name: "Streetwear" },
                    { name: "Futuristic" },
                ]
            }
        }
    })

    const minimalistTee = await prisma.product.create({
        data: {
            name: "Matte Black Tee",
            slug: "matte-black-tee",
            description: "A luxury minimalist tee crafted from heavy-weight organic cotton. Designed for a perfect boxy fit.",
            price: 45.00,
            sku: "MT-001",
            status: ProductStatus.ACTIVE,
            categoryId: minimalistBasics.id,
            metaTitle: "Matte Black Tee | Ultimate E-Commerce",
            metaDescription: "The essential matte black tee for a minimalist wardrobe.",
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1920&auto=format&fit=crop", alt: "Matte Black Tee", position: 0 },
                ]
            },
            options: {
                create: [
                    {
                        name: "Size",
                        values: {
                            create: [
                                { value: "S" },
                                { value: "M" },
                                { value: "L" },
                                { value: "XL" },
                            ]
                        }
                    }
                ]
            },
            tags: {
                create: [
                    { name: "Minimalist" },
                    { name: "Basics" },
                    { name: "Black" },
                ]
            }
        }
    })

    // Add more products if needed...

    console.log("Seeding completed successfully!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
