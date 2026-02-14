"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, ChevronRight, Star, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProductCard } from "@/components/product/product-card"
import { useCart } from "@/store/use-cart"

export default function ProductPage({ params }: { params: { slug: string } }) {
    const { data: product, isLoading } = api.product.getBySlug.useQuery({
        slug: params.slug
    })

    const { data: relatedProducts } = api.product.getRelated.useQuery(
        { slug: params.slug, categoryId: product?.categoryId ?? "" },
        { enabled: !!product }
    )

    const { addItem } = useCart()
    const [selectedImage, setSelectedImage] = React.useState(0)
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({})

    if (isLoading) return <PDPLoading />
    if (!product) return notFound()

    // Find matching variant based on selected options
    const selectedVariant = product.variants.find((variant: any) =>
        variant.optionValues.every((ov: any) => selectedOptions[ov.option.name] === ov.value)
    )

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }))
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            slug: product.slug,
            price: Number(selectedVariant?.price || product.price),
            image: product.images[0]?.url || "/placeholder.jpg",
            quantity: 1,
            options: selectedOptions,
        })
    }

    const displayPrice = selectedVariant?.price || product.price

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-8">
                <Link href="/">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/products">Shop</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-[4/5] bg-charcoal overflow-hidden border-2 border-border">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <Image
                                    src={product.images[selectedImage]?.url || "/placeholder.jpg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img: any, idx: number) => (
                            <button
                                key={img.id}
                                onClick={() => setSelectedImage(idx)}
                                className={cn(
                                    "relative aspect-square bg-charcoal border-2 transition-all",
                                    selectedImage === idx ? "border-neon-green" : "border-border hover:border-neon-green/50"
                                )}
                            >
                                <Image
                                    src={img.url}
                                    alt={`${product.name} thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-8">
                    <div>
                        <span className="text-neon-green text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                            {product.category?.name}
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-4">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center text-neon-green">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                24 Reviews
                            </span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-black">${displayPrice.toString()}</span>
                        {product.compareAtPrice && (
                            <span className="text-xl text-muted-foreground line-through font-bold">
                                ${product.compareAtPrice.toString()}
                            </span>
                        )}
                        {selectedVariant && selectedVariant.quantity === 0 && (
                            <span className="text-xs text-electric-pink font-black uppercase tracking-widest">
                                OUT OF STOCK
                            </span>
                        )}
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                        {product.description}
                    </p>

                    {/* Options */}
                    <div className="space-y-6">
                        {product.options.map((option: any) => (
                            <div key={option.id} className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest flex justify-between">
                                    {option.name}
                                    <span className="text-neon-green">{selectedOptions[option.name] || "Select"}</span>
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {option.values.map((val: any) => (
                                        <button
                                            key={val.id}
                                            onClick={() => handleOptionSelect(option.name, val.value)}
                                            className={cn(
                                                "px-6 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                                selectedOptions[option.name] === val.value
                                                    ? "bg-neon-green border-neon-green text-black"
                                                    : "border-border hover:border-white"
                                            )}
                                        >
                                            {val.value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add to Cart */}
                    <div className="flex gap-4 pt-8">
                        <Button
                            onClick={handleAddToCart}
                            disabled={selectedVariant && selectedVariant.quantity === 0}
                            className="h-16 flex-grow bg-white text-black font-black uppercase tracking-widest rounded-none text-lg hover:bg-neon-green border-2 border-transparent hover:border-black transition-all shadow-[8px_8px_0px_#000]"
                        >
                            <ShoppingBag className="w-6 h-6 mr-2" />
                            Add to Bags
                        </Button>
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-none border-2 border-border hover:border-neon-green hover:text-neon-green text-white">
                            <Heart className="w-6 h-6" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-16 w-16 rounded-none border-2 border-border hover:border-neon-green hover:text-neon-green text-white">
                            <Share2 className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Guarantee / Features */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-charcoal border border-neon-green/30">
                                <span className="text-neon-green text-[10px] font-black">24H</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Global Shipping</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-charcoal border border-neon-green/30">
                                <span className="text-neon-green text-[10px] font-black">QC</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Premium Quality</span>
                        </div>
                    </div>

                    {/* Accordion Info */}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details" className="border-b-2 border-charcoal">
                            <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest hover:text-neon-green text-white">Details & Specs</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-xs leading-relaxed py-4 space-y-4">
                                <p>Designed for high-performance urban mobility, this piece features reinforced stitching and climate-adaptive textiles.</p>
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>Reinforced stress points</li>
                                    <li>Breathable technical mesh lining</li>
                                    <li>Hidden accessory pocket</li>
                                    <li>Signature neon detailing</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="shipping" className="border-b-2 border-charcoal">
                            <AccordionTrigger className="text-[10px] font-black uppercase tracking-widest hover:text-neon-green text-white">Shipping & Returns</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-xs leading-relaxed py-4">
                                <p>Standard global shipping takes 3-7 business days. Express options available at checkout. We offer a 30-day "no-questions-asked" return policy on all unworn items with original tags.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>

            {/* Reviews Section Mockup */}
            <section className="py-24 border-t-4 border-charcoal mb-24">
                <h2 className="text-4xl font-black uppercase tracking-tight mb-12 italic text-white">
                    CRITICAL <span className="text-neon-green">REVIEWS</span> (24)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-charcoal p-8 border-l-4 border-neon-green">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs mb-1 text-white">USER_NAME_88</h4>
                                    <div className="flex text-neon-green">
                                        {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                                <span className="text-[8px] font-bold text-muted-foreground">24 FEB 2026</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">
                                "The build quality is insane. The neon accents actually glow under sunlight. Best purchase this year for my cyber-kit."
                            </p>
                        </div>
                    ))}
                </div>
                <Button variant="outline" className="mt-12 rounded-none border-2 border-white uppercase font-black tracking-widest text-xs px-8 text-white">
                    Load More Reviews
                </Button>
            </section>

            {/* Related Products */}
            {relatedProducts && relatedProducts.length > 0 && (
                <section className="py-24 border-t-4 border-charcoal">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-4xl font-black uppercase tracking-tight italic text-white">
                            YOU MIGHT <span className="text-neon-green">VIBE</span> WITH
                        </h2>
                        <Link href="/products" className="text-neon-green text-[10px] font-black uppercase tracking-[0.2em] border-b border-neon-green pb-1">
                            View All +
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {relatedProducts.map(relProduct => (
                            <ProductCard key={relProduct.id} product={relProduct as any} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function PDPLoading() {
    return (
        <div className="container mx-auto px-4 py-12 animate-pulse">
            <div className="h-4 w-64 bg-charcoal mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-4">
                    <div className="aspect-[4/5] bg-charcoal" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-charcoal" />)}
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-charcoal" />
                        <div className="h-16 w-full bg-charcoal" />
                    </div>
                    <div className="h-8 w-48 bg-charcoal" />
                    <div className="h-32 w-full bg-charcoal" />
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-12 w-full bg-charcoal" />)}
                    </div>
                </div>
            </div>
        </div>
    )
}
