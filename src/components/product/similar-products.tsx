"use client"

import { api } from "@/trpc/react"
import { ProductCard } from "./product-card"
import { ProductCardSkeleton } from "./product-card-skeleton"
import { motion } from "framer-motion"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SimilarProductsProps {
    slug: string
    categories?: { id: string; name: string }[]
}

export function SimilarProducts({ slug, categories }: SimilarProductsProps) {
    const [activeCategoryId, setActiveCategoryId] = React.useState<string | undefined>(categories?.[0]?.id)

    if (!activeCategoryId) return null

    const { data: products, isLoading } = api.product.getRelated.useQuery({
        slug,
        categoryId: activeCategoryId
    })

    if (isLoading) {
        return (
            <section className="mt-24 pt-16 border-t border-white/10">
                <div className="mb-12">
                    <div className="h-12 w-64 bg-white/5 animate-pulse mb-4" />
                    <div className="h-4 w-48 bg-white/5 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </section>
        )
    }

    if (!products || products.length === 0) return null

    return (
        <section className="mt-24 pt-16 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
                        SIMILAR <span className="text-gray-400">ITEMS</span>
                    </h2>
                    <p className="text-muted-foreground uppercase tracking-widest font-bold text-[10px] mt-2">
                        Recommended products you might like
                    </p>
                </div>

                {categories && categories.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveCategoryId(cat.id)}
                                className={cn(
                                    "rounded-none font-black uppercase text-[10px] tracking-widest transition-all",
                                    activeCategoryId === cat.id
                                        ? "bg-black text-white border-black"
                                        : "border-gray-200 hover:border-black text-black"
                                )}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {products.map((product: any, idx: number) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
