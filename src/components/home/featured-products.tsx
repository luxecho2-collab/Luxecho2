"use client"

import { api } from "@/trpc/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { ProductCard } from "@/components/product/product-card"
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton"

export function FeaturedProducts() {
    const { data: products, isLoading } = api.product.getFeatured.useQuery()

    if (isLoading) {
        return (
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="h-12 w-64 bg-charcoal animate-pulse mb-12" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">
                            LATEST <span className="text-neon-green">DROPS</span>
                        </h2>
                        <p className="text-muted-foreground uppercase tracking-widest font-bold">
                            High-performance gear for the digital frontier
                        </p>
                    </div>
                    <Link href="/products">
                        <Button variant="link" className="text-neon-green uppercase font-black tracking-widest text-lg p-0">
                            View All Arrivals +
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {products?.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
