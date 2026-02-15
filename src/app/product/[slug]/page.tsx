"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, ChevronRight, Star, Share2, ShieldCheck, Truck, RefreshCcw, Tag, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/use-cart"
import { SimilarProducts } from "@/components/product/similar-products"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params)
    const { data: product, isLoading } = api.product.getBySlug.useQuery({
        slug: slug
    })

    const { addItem } = useCart()
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const utils = api.useUtils()

    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({})
    const [activeImageIndex, setActiveImageIndex] = React.useState<number | null>(null)

    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    const isInWishlist = wishlist?.some((item) => item.productId === product?.id)

    const { mutate: toggleWishlist, isPending: isToggling } = api.account.toggleWishlist.useMutation({
        onSuccess: (data) => {
            void utils.account.getWishlist.invalidate()
            toast({
                title: data.added ? "Added to Wishlist" : "Removed from Wishlist",
                description: `${product?.name} has been ${data.added ? "added to" : "removed from"} your archive.`,
                className: "bg-black border-2 border-neon-green text-white font-black uppercase rounded-none",
            })
        },
        onError: (err) => {
            toast({
                title: "Error",
                description: err.message || "Failed to update wishlist. Access denied.",
                variant: "destructive",
                className: "bg-black border-2 border-electric-pink text-white font-black uppercase rounded-none",
            })
        }
    })

    const handleToggleWishlist = () => {
        if (!session) {
            toast({
                title: "Authentication Required",
                description: "Log in to sync this gear to your archive.",
                className: "bg-black border-2 border-electric-pink text-white font-black uppercase rounded-none",
            })
            router.push("/api/auth/signin")
            return
        }
        if (product) {
            toggleWishlist({ productId: product.id })
        }
    }

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
        <div className="min-h-screen bg-black text-white selection:bg-neon-green selection:text-black">
            {/* Image Lightbox / Fullscreen View */}
            {activeImageIndex !== null && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
                    onClick={() => setActiveImageIndex(null)}
                >
                    <div className="relative w-full h-full max-w-5xl">
                        <Image
                            src={product.images[activeImageIndex]?.url || ""}
                            alt={product.name}
                            fill
                            className="object-contain"
                            priority
                        />
                        <button
                            className="absolute top-0 right-0 p-4 text-white hover:text-neon-green transition-colors font-black text-xl uppercase tracking-widest"
                            onClick={() => setActiveImageIndex(null)}
                        >
                            [ Close ]
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Breadcrumbs */}
            <div className="border-b border-white/5">
                <nav className="container mx-auto px-4 py-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Link href="/" className="hover:text-neon-green transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/products" className="hover:text-neon-green transition-colors">Catalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white truncate max-w-[150px] md:max-w-none">{product.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-20">

                    {/* LEFT COLUMN: MULTI-IMAGE GRID */}
                    <div className="lg:col-span-12 xl:col-span-8">
                        <div className={cn(
                            "grid gap-6",
                            product.images.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                        )}>
                            {product.images.map((img, idx) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                                    className={cn(
                                        "relative overflow-hidden group border border-white/10 bg-[#0A0A0A] cursor-zoom-in",
                                        product.images.length === 1 ? "aspect-[21/9]" : "aspect-[4/5]"
                                    )}
                                    onClick={() => setActiveImageIndex(idx)}
                                >
                                    <Image
                                        src={img.url}
                                        alt={`${product.name} view ${idx + 1}`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-all duration-700 ease-in-out"
                                        priority={idx < 2}
                                        unoptimized // Using Unsplash, unoptimized might be faster for dev/seed testing
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-neon-green px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-black">
                                            Expanded Detail 0{idx + 1}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STICKY INFO PANEL */}
                    <div className="lg:col-span-12 xl:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-10">
                            {/* Product Header */}
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="inline-block px-3 py-1 bg-neon-green text-black font-black uppercase tracking-[0.2em] text-[10px] -skew-x-12"
                                >
                                    {product.categories?.[0]?.name || "Premium Collection"}
                                </motion.div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center bg-white/5 px-2 py-1 border border-white/10 italic">
                                        <span className="text-sm font-black mr-1">4.2</span>
                                        <Star className="w-3.5 h-3.5 fill-neon-green text-neon-green" />
                                    </div>
                                    <div className="w-[1px] h-4 bg-white/10" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        1.2K Verified Drops
                                    </span>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-black tracking-tighter text-white">₹{displayPrice.toLocaleString('en-IN')}</span>
                                    {originalPrice && (
                                        <>
                                            <span className="text-xl text-white/30 line-through font-bold">₹{originalPrice.toLocaleString('en-IN')}</span>
                                            <span className="text-xl font-black text-electric-pink uppercase italic">-{discount}%</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-[10px] font-black text-neon-green uppercase tracking-widest">
                                    Price includes all digital duties
                                </p>
                            </div>

                            {/* Options / Select Size */}
                            <div className="space-y-8">
                                {product.options.map((option: any) => (
                                    <div key={option.id} className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                                                Select {option.name}
                                                {!selectedOptions[option.name] && <span className="ml-2 text-[9px] text-electric-pink lowercase font-bold opacity-70">Required*</span>}
                                            </h3>
                                            <button className="text-[10px] font-bold text-neon-green uppercase tracking-widest border-b border-neon-green/30 hover:border-neon-green transition-all">
                                                Size Chart +
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {option.values.map((val: any) => (
                                                <button
                                                    key={val.id}
                                                    onClick={() => handleOptionSelect(option.name, val.value)}
                                                    className={cn(
                                                        "w-14 h-14 flex items-center justify-center border-2 text-sm font-black transition-all duration-300 relative overflow-hidden",
                                                        selectedOptions[option.name] === val.value
                                                            ? "bg-neon-green border-neon-green text-black scale-110 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                                                            : "border-white/10 hover:border-white text-white/50 hover:text-white"
                                                    )}
                                                >
                                                    {val.value}
                                                    {selectedOptions[option.name] === val.value && (
                                                        <motion.div
                                                            layoutId="active-option"
                                                            className="absolute inset-0 bg-white/10"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={selectedVariant && selectedVariant.quantity === 0}
                                    className="h-16 flex-[2] bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-md hover:bg-neon-green/90 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-[8px_8px_0px_#1A1A1A] hover:shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Add to Bag
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleToggleWishlist}
                                    disabled={isToggling}
                                    className={cn(
                                        "h-16 flex-1 rounded-none border-2 transition-all duration-300 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs",
                                        isInWishlist
                                            ? "bg-neon-green border-neon-green text-black hover:bg-electric-pink hover:border-electric-pink hover:text-white"
                                            : "border-white/10 hover:border-white hover:bg-white/5"
                                    )}
                                >
                                    <Heart className={cn(
                                        "w-5 h-5 transition-transform duration-300",
                                        isInWishlist && "fill-current"
                                    )} />
                                    {isInWishlist ? "In Archive" : "Wishlist"}
                                </Button>
                            </div>

                            {/* Delivery Section */}
                            <div className="space-y-4 pt-6 p-6 bg-white/5 border border-white/10">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    Check Availability <Truck className="w-4 h-4 text-neon-green" />
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="PINCODE"
                                        className="h-12 px-4 bg-black border border-white/10 text-xs font-bold focus:outline-none focus:border-neon-green flex-grow placeholder:text-white/20"
                                    />
                                    <Button variant="ghost" className="h-12 px-6 text-neon-green font-black text-[10px] uppercase tracking-widest hover:bg-neon-green/5">
                                        Check
                                    </Button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-white/5 bg-charcoal/50 space-y-2">
                                    <ShieldCheck className="w-5 h-5 text-neon-green" />
                                    <p className="text-[10px] font-black uppercase tracking-wider leading-tight">100% Legit <br /> <span className="text-muted-foreground">Authenticated</span></p>
                                </div>
                                <div className="p-4 border border-white/5 bg-charcoal/50 space-y-2">
                                    <RefreshCcw className="w-5 h-5 text-electric-pink" />
                                    <p className="text-[10px] font-black uppercase tracking-wider leading-tight">Easy Returns <br /> <span className="text-muted-foreground">14 Days Window</span></p>
                                </div>
                            </div>

                            {/* Product Details Section */}
                            <div className="space-y-6 pt-10 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neon-green">Product Details</h3>
                                    <div className="flex-grow h-[1px] bg-white/10" />
                                </div>
                                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed font-medium">
                                    {product.description.split('\n').map((line: string, i: number) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-6 italic">
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Fabric & Materials</span>
                                        <p className="text-xs font-bold text-white uppercase">Premium Organic Cotton Mix</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Fit Guide</span>
                                        <p className="text-xs font-bold text-white uppercase">Boxy / Aggressive Oversize</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Design Details</span>
                                        <p className="text-xs font-bold text-white uppercase">Matte Zinc Hardware</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">SKU</span>
                                        <p className="text-xs font-mono font-bold text-neon-green uppercase">{product.sku}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products Section */}
                <SimilarProducts slug={product.slug} categories={product.categories} />

                {/* Reviews Section */}
                <section className="mt-32 pt-16 border-t border-white/10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">FEED <span className="text-neon-green">BACK</span></h2>
                            <p className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em] mt-2">Verified Field Data from the Community</p>
                        </div>
                        <Button className="rounded-none bg-white text-black font-black uppercase tracking-widest text-[10px] h-12 px-10 hover:bg-neon-green transition-colors">
                            Leave a Report
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-white/10 p-[1px]">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-6 p-10 bg-black">
                                <div className="flex items-center gap-1 text-neon-green">
                                    {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="text-lg font-bold leading-tight uppercase tracking-tight text-white/90">
                                    "Absolutely outstanding build quality. FIT IS AGGRESSIVE."
                                </p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">USER._{i}09</span>
                                        <span className="text-[9px] text-neon-green font-bold">VERIFIED_HACKER</span>
                                    </div>
                                    <span className="text-[9px] text-white/20 font-bold tracking-widest">15.02.26</span>
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
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
                <span className="text-neon-green font-black uppercase tracking-[0.4em] text-xs">Loading Data...</span>
            </div>
        </div>
    )
}
