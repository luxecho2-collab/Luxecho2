import { PrismaClient, ProductStatus } from "@prisma/client"
import "dotenv/config"

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding database...")

    // Clear existing data
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    await prisma.tag.deleteMany()

    // Create Categories
    const neonEssentials = await prisma.category.upsert({
        where: { slug: "neon-essentials" },
        update: {},
        create: {
            name: "Neon Essentials",
            slug: "neon-essentials",
            description: "High-visibility garments with neon accents.",
            image: "/images/categories/neon-essentials.png",
        },
    })

    const cyberStreetwear = await prisma.category.upsert({
        where: { slug: "cyber-streetwear" },
        update: {},
        create: {
            name: "Cyber Streetwear",
            slug: "cyber-streetwear",
            description: "Futuristic designs for the urban explorer.",
            image: "/images/categories/cyber-streetwear.png",
        },
    })

    const minimalistBasics = await prisma.category.upsert({
        where: { slug: "minimalist-basics" },
        update: {},
        create: {
            name: "Minimalist Basics",
            slug: "minimalist-basics",
            description: "Essential pieces for a clean, modern look.",
            image: "/images/categories/minimalist-basics.png",
        },
    })

    // Create Products
    const cyberHoodie = await prisma.product.create({
        data: {
            name: "Cyber Neon Hoodie",
            slug: "cyber-neon-hoodie",
            description: "A premium oversized hoodie with neon green accents and cyber-inspired graphics. Crafted from heavy-weight technical fleece for ultimate comfort and durability.",
            price: 120.00,
            compareAtPrice: 150.00,
            sku: "CH-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: cyberStreetwear.id }, { id: neonEssentials.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=1200", alt: "Cyber Neon Hoodie 1", position: 0 },
                    { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200", alt: "Cyber Neon Hoodie 2", position: 1 },
                    { url: "https://images.unsplash.com/photo-1509942700367-aba919809730?auto=format&fit=crop&q=80&w=1200", alt: "Cyber Neon Hoodie 3", position: 2 },
                ]
            },
            options: {
                create: [
                    {
                        name: "Size",
                        values: {
                            create: [{ value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }]
                        }
                    }
                ]
            }
        }
    })

    const minimalistTee = await prisma.product.create({
        data: {
            name: "Matte Black Tee",
            slug: "matte-black-tee",
            description: "A luxury minimalist tee crafted from heavy-weight organic cotton. Designed for a perfect boxy fit with reinforced seams.",
            price: 45.00,
            sku: "MT-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: minimalistBasics.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200", alt: "Matte Black Tee 1", position: 0 },
                    { url: "https://images.unsplash.com/photo-1503342452335-ee8c7d55e691?auto=format&fit=crop&q=80&w=1200", alt: "Matte Black Tee 2", position: 1 },
                    { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1200", alt: "Matte Black Tee 3", position: 2 },
                ]
            },
            options: {
                create: [
                    {
                        name: "Size",
                        values: {
                            create: [{ value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }]
                        }
                    }
                ]
            }
        }
    })

    const stealthCargo = await prisma.product.create({
        data: {
            name: "Stealth Cargo Pants",
            slug: "stealth-cargo-pants",
            description: "Multi-pocket tactical cargo pants with water-resistant finish and adjustable cuffs. Engineered for the modern nomad.",
            price: 85.00,
            sku: "SCP-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: cyberStreetwear.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=1200", alt: "Stealth Cargo Pants 1", position: 0 },
                    { url: "https://images.unsplash.com/photo-1620012253295-c05718565d6d?auto=format&fit=crop&q=80&w=1200", alt: "Stealth Cargo Pants 2", position: 1 },
                ]
            }
        }
    })

    const neonBeanie = await prisma.product.create({
        data: {
            name: "Acid Neon Beanie",
            slug: "acid-neon-beanie",
            description: "A vibrant ribbed knit beanie that adds a sharp pop of color to any techwear fit. High-visibility and incredibly soft.",
            price: 25.00,
            sku: "ANB-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: neonEssentials.id }, { id: cyberStreetwear.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1625910513397-22a99c9263f3?auto=format&fit=crop&q=80&w=1200", alt: "Acid Neon Beanie 1", position: 0 },
                    { url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=1200", alt: "Acid Neon Beanie 2", position: 1 },
                ]
            }
        }
    })

    // Dynamic additions for better UI
    await prisma.product.create({
        data: {
            name: "Cyber Ghost Jacket",
            slug: "cyber-ghost-jacket",
            description: "Translucent water-proof shell with reflective branding. The ultimate urban protective layer.",
            price: 185.00,
            sku: "CGJ-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: cyberStreetwear.id }, { id: neonEssentials.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=1200", alt: "Ghost Jacket 1", position: 0 },
                    { url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1200", alt: "Ghost Jacket 2", position: 1 },
                ]
            }
        }
    })

    await prisma.product.create({
        data: {
            name: "Minimalist Shell Parka",
            slug: "minimal-shell-parka",
            description: "Clean lines and technical performance. A breathable parka for the minimalist aesthetic.",
            price: 210.00,
            sku: "MSP-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: minimalistBasics.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=1200", alt: "Shell Parka", position: 0 },
                ]
            }
        }
    })

    await prisma.product.create({
        data: {
            name: "Electro Tech Gloves",
            slug: "electro-tech-gloves",
            description: "Touch-sensitive utility gloves with neon stitching.",
            price: 35.00,
            sku: "ETG-001",
            status: ProductStatus.ACTIVE,
            categories: {
                connect: [{ id: neonEssentials.id }]
            },
            images: {
                create: [
                    { url: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=1200", alt: "Tech Gloves", position: 0 },
                ]
            }
        }
    })

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
