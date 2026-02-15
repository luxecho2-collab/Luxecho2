"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, ChevronRight, Star, Share2, ShieldCheck, Truck, RefreshCcw, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/use-cart"

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const { data: product, isLoading } = api.product.getBySlug.useQuery({
        slug: slug
    })

    const { addItem } = useCart()
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
    const originalPrice = selectedVariant?.compareAtPrice || product.compareAtPrice
    const discount = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0

    return (
        <div className="min-h-screen bg-white text-black">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100">
                <nav className="container mx-auto px-4 py-4 flex items-center gap-2 text-[11px] font-medium text-gray-500 uppercase tracking-tight">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/products" className="hover:text-black transition-colors">Catalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-black font-semibold truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16">

                    {/* LEFT COLUMN: MULTI-IMAGE GRID (MYNTRA STYLE) */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.images.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="relative aspect-[3/4] overflow-hidden group border border-gray-100 bg-gray-50"
                                >
                                    <Image
                                        src={img.url}
                                        alt={`${product.name} view ${idx + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        priority={idx < 2}
                                    />
                                </motion.div>
                            ))}
                            {/* If few images, show some placeholders/empty space or stretch */}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STICKY INFO PANEL */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-24 space-y-8">
                            {/* Product Header */}
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-gray-500 font-medium text-lg leading-snug">
                                    {product.categories?.[0]?.name || "Premium Collection"}
                                </p>

                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex items-center bg-gray-50 px-2 py-1 border border-gray-100 rounded">
                                        <span className="text-sm font-bold mr-1">4.2</span>
                                        <Star className="w-3.5 h-3.5 fill-black text-black" />
                                    </div>
                                    <div className="w-[1px] h-4 bg-gray-200" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                        1.2K Ratings
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Pricing Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold">₹{displayPrice.toLocaleString('en-IN')}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-lg text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                                            <span className="text-lg font-bold text-orange-500 uppercase">({discount}% OFF)</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                                    Inclusive of all taxes
                                </p>
                            </div>

                            {/* Options / Select Size */}
                            <div className="space-y-6">
                                {product.options.map((option: any) => (
                                    <div key={option.id} className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                                                Select {option.name}
                                                {!selectedOptions[option.name] && <span className="text-[10px] text-red-500 lowercase font-medium opacity-0 group-hover:opacity-100 transition-opacity">Please select</span>}
                                            </h3>
                                            <button className="text-[10px] font-bold text-neon-green uppercase tracking-widest border-b border-neon-green/30 hover:border-neon-green transition-all">
                                                Size Chart {'>'}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {option.values.map((val: any) => (
                                                <button
                                                    key={val.id}
                                                    onClick={() => handleOptionSelect(option.name, val.value)}
                                                    className={cn(
                                                        "w-12 h-12 flex items-center justify-center border-2 text-xs font-bold transition-all rounded-full",
                                                        selectedOptions[option.name] === val.value
                                                            ? "bg-black border-black text-white"
                                                            : "border-gray-200 hover:border-black text-gray-600"
                                                    )}
                                                >
                                                    {val.value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={selectedVariant && selectedVariant.quantity === 0}
                                    className="h-14 flex-[2] bg-black text-white font-bold uppercase tracking-widest rounded-none text-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingBag className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Add to Bag
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 flex-1 rounded-none border-2 border-gray-200 font-bold uppercase tracking-widest text-xs hover:border-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Heart className="w-5 h-5" />
                                    Wishlist
                                </Button>
                            </div>

                            {/* Delivery Section */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    Delivery Options <Truck className="w-4 h-4" />
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        className="h-10 px-4 border border-gray-200 text-xs font-medium focus:outline-none focus:border-black flex-grow"
                                    />
                                    <Button variant="ghost" className="h-10 px-4 text-neon-green font-bold text-[10px] uppercase tracking-widest hover:bg-neon-green/5">
                                        Check
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        <ShieldCheck className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider">100% Original Products</p>
                                        <p className="text-[10px] text-gray-500">Authenticity guaranteed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                                        <RefreshCcw className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider">Easy 14 days returns</p>
                                        <p className="text-[10px] text-gray-500">And exchanges policy</p>
                                    </div>
                                </div>
                            </div>

                            {/* Offers Card */}
                            <div className="p-6 bg-orange-50/50 border border-orange-100 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-orange-800">
                                    Best Offers <Tag className="w-3.5 h-3.5" />
                                </h3>
                                <ul className="space-y-3">
                                    <li className="text-[11px] leading-relaxed text-orange-900">
                                        <strong>10% Instant Discount</strong> on ICICI Bank Credit Card. <br />
                                        <span className="text-[10px] opacity-70">Min Spend ₹3,500. Max Discount ₹1,000.</span>
                                    </li>
                                    <li className="text-[11px] leading-relaxed text-orange-900">
                                        <strong>Flat ₹200 Off</strong> on your first purchase. <br />
                                        <span className="text-[10px] opacity-70">Use Code: FUNKYFIRST</span>
                                    </li>
                                </ul>
                                <button className="text-[10px] font-bold text-orange-600 uppercase tracking-widest border-b border-orange-200">
                                    View All Offers
                                </button>
                            </div>

                            {/* Product Specifications */}
                            <div className="space-y-6 pt-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-2 inline-block">Product Details</h3>
                                <div className="space-y-2 text-sm text-gray-600 leading-relaxed font-medium">
                                    {product.description.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Material</span>
                                        <p className="text-xs font-semibold">100% Technical Cotton</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Fit</span>
                                        <p className="text-xs font-semibold">Oversized / Boxy</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Color</span>
                                        <p className="text-xs font-semibold">Matte Stealth Black</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Style ID</span>
                                        <p className="text-xs font-semibold font-mono uppercase">{product.sku}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section Card */}
                <section className="mt-24 pt-16 border-t border-gray-100">
                    <div className="flex items-end justify-between mb-12">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold uppercase tracking-tight">Ratings & Reviews</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest font-mono">Verified Purchase Experiences</p>
                        </div>
                        <Button variant="outline" className="rounded-none border-2 border-black font-bold uppercase tracking-widest text-[10px] h-10">
                            Write a Review
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-4 p-6 bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-1 text-black">
                                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-3 h-3 fill-black text-black" />)}
                                </div>
                                <p className="text-sm font-medium leading-relaxed italic text-gray-700">
                                    "Absolutely outstanding build quality. The fit is exactly as described and the fabric feels incredibly premium."
                                </p>
                                <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Rohan Malhotra</span>
                                    <span className="text-[9px] text-gray-400 font-bold">15 FEB 2026</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

function PDPLoading() {
    return (
        <div className="container mx-auto px-4 py-12 animate-pulse space-y-12">
            <div className="h-4 w-64 bg-gray-100 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100" />)}
                </div>
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <div className="h-8 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-3/4 bg-gray-100 rounded" />
                    </div>
                    <div className="h-12 w-48 bg-gray-100 rounded" />
                    <div className="h-40 w-full bg-gray-100 rounded" />
                    <div className="h-24 w-full bg-gray-100 rounded" />
                </div>
            </div>
        </div>
    )
}
