"use client"

import { api } from "@/trpc/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { ProductCard } from "@/components/product/product-card"
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton"

interface FeaturedProductsProps {
    limit?: number
    offset?: number
    hideHeader?: boolean
}

export function FeaturedProducts({ limit, offset = 0, hideHeader = false }: FeaturedProductsProps) {
    const { data: products, isLoading } = api.product.getFeatured.useQuery()

    const displayProducts = products?.slice(offset, limit ? offset + limit : undefined)

    if (isLoading) {
        return (
            <section className={hideHeader ? "py-8" : "py-24"}>
                <div className="container mx-auto px-4">
                    {!hideHeader && <div className="h-12 w-64 bg-charcoal animate-pulse mb-12" />}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: limit || 4 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={`bg-white ${hideHeader ? "py-8" : "py-32"}`}>
            <div className="container mx-auto px-6 lg:px-12">
                {!hideHeader && (
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-[2px] w-12 bg-black" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">New Drops</span>
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">
                                LATEST <span className="text-black/20">WAVES</span>
                            </h2>
                        </div>
                        <Link href="/products" className="group">
                            <Button variant="link" className="text-black/60 uppercase font-black tracking-widest text-sm p-0 flex items-center gap-3 hover:no-underline">
                                <span className="group-hover:text-black transition-colors">View All Collections</span>
                                <div className="w-8 h-8 border border-black/20 flex items-center justify-center rotate-45 group-hover:border-black transition-all">
                                    <span className="text-black text-[10px] -rotate-45">+</span>
                                </div>
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {displayProducts?.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {hideHeader && (
                    <div className="mt-16 flex justify-center">
                        <Link href="/products" className="group flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-black/60 hover:text-black transition-colors">
                            View More
                            <span className="w-8 h-px bg-black/30 group-hover:w-16 group-hover:bg-black transition-all duration-500" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
