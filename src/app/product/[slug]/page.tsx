"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Heart, ChevronRight, Star, ShieldCheck, Truck, RefreshCcw, X, Plus, Minus, Share2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/store/use-cart"
import { SimilarProducts } from "@/components/product/similar-products"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

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
    const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0)
    const [showSizeChart, setShowSizeChart] = React.useState(false)
    const [lightboxImage, setLightboxImage] = React.useState<string | null>(null)
    const [quantity, setQuantity] = React.useState(1)
    const [isZoomMode, setIsZoomMode] = React.useState(false)

    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    const isInWishlist = wishlist?.some((item) => item.productId === product?.id)

    const { mutate: toggleWishlist, isPending: isToggling } = api.account.toggleWishlist.useMutation({
        onSuccess: (data) => {
            void utils.account.getWishlist.invalidate()
            toast({
                title: data.added ? "Added to Wishlist" : "Removed from Wishlist",
                description: `${product?.name} has been ${data.added ? "added to" : "removed from"} your wishlist.`,
            })
        },
    })

    const handleToggleWishlist = () => {
        if (!session) {
            router.push("/api/auth/signin")
            return
        }
        if (product) {
            toggleWishlist({ productId: product.id })
        }
    }

    if (isLoading) return <PDPLoading />
    if (!product) return notFound()

    const selectedVariant = product.variants.find((variant: any) =>
        variant.optionValues.every((ov: any) => selectedOptions[ov.option.name] === ov.value)
    )

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }))
    }

    const handleAddToCart = () => {
        if (product.options.length > Object.keys(selectedOptions).length) {
            toast({
                title: "Please select all options",
                description: "Choose color and size before adding to bag.",
                variant: "destructive"
            })
            return
        }
        addItem({
            id: product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            name: product.name,
            slug: product.slug,
            price: Number(selectedVariant?.price || product.price),
            image: product.images[0]?.url || "/placeholder.jpg",
            quantity: quantity,
            options: selectedOptions,
        })
        toast({
            title: "Added to Bag",
            description: `${product.name} has been added to your bag.`,
        })
    }

    const handleBuyNow = () => {
        if (product.options.length > Object.keys(selectedOptions).length) {
            toast({
                title: "Please select all options",
                description: "Choose color and size before proceeding.",
                variant: "destructive"
            })
            return
        }
        handleAddToCart()
        router.push("/cart")
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast({
            title: "Link Copied",
            description: "Catalog link copied to clipboard.",
        })
    }

    const displayPrice = selectedVariant?.price || product.price
    const originalPrice = selectedVariant?.compareAtPrice || product.compareAtPrice

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Image Lightbox: Full-screen Technical View */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-10 right-10 z-[120] w-14 h-14 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all rounded-full"
                            onClick={() => setLightboxImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={lightboxImage}
                                alt="Full View"
                                fill
                                className="object-contain"
                                priority
                            />

                            {/* Technical Overlays for brand vibe */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/30" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/30" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/30" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/30" />
                            </div>
                        </motion.div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                            Luxecho / Technical Exploration Mode
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-12">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/products" className="hover:text-black transition-colors">Catalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-black font-bold">{product.name}</span>
                </nav>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* LEFT COLUMN: TECHNICAL LOOKBOOK VIEWER */}
                    <div className="lg:col-span-12 xl:col-span-8 xl:sticky xl:top-36 h-fit">
                        <div className="flex flex-col md:flex-row gap-6 h-[85vh] md:h-[95vh]">
                            {/* Vertical Thumbnail Rail */}
                            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto w-full md:w-24 scrollbar-hide">
                                {product.images.map((img: any, idx: number) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                            "relative flex-shrink-0 w-20 h-24 md:w-full md:h-32 transition-all duration-300 border-2",
                                            isZoomMode ? "bg-white" : "bg-gray-50",
                                            activeImageIndex === idx ? "border-black" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={`${product.name} thumbnail ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        {activeImageIndex === idx && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                <div className="w-1 h-1 bg-black rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Main Hero Viewer */}
                            <div
                                className={cn(
                                    "order-1 md:order-2 flex-1 relative border border-gray-100 overflow-hidden group transition-all duration-700 min-h-[500px] md:min-h-0",
                                    isZoomMode
                                        ? "bg-white shadow-[inset_0_0_100px_rgba(212,255,0,0.1)]"
                                        : "bg-gray-50"
                                )}
                                onClick={() => setIsZoomMode(!isZoomMode)}
                            >
                                {/* Subtle Mesh Gradient Overlay for Zoom Mode */}
                                <AnimatePresence>
                                    {isZoomMode && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 pointer-events-none z-0"
                                            style={{
                                                background: `radial-gradient(at 0% 0%, rgba(212, 255, 0, 0.05) 0px, transparent 50%),
                                                             radial-gradient(at 100% 100%, rgba(147, 51, 234, 0.05) 0px, transparent 50%)`
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeImageIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="relative w-full h-full cursor-zoom-in"
                                    >
                                        <LookbookHeroImage
                                            src={product.images[activeImageIndex]?.url}
                                            name={product.name}
                                            index={activeImageIndex}
                                            isZoomed={isZoomMode}
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Lightbox Toggle Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxImage(product.images[activeImageIndex]?.url || null);
                                    }}
                                    className="absolute bottom-8 right-8 w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full shadow-lg border border-gray-100 text-black hover:bg-black hover:text-white transition-all z-40 transform hover:scale-110 active:scale-95 transition-all"
                                    title="Open Full View"
                                >
                                    <Search className="w-5 h-5" />
                                </button>

                                {/* Technical Navigation Arrows */}
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 pointer-events-none z-30">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1);
                                        }}
                                        className="w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full shadow-lg border border-gray-100 text-black hover:bg-black hover:text-white transition-all pointer-events-auto transform hover:-translate-x-1 active:scale-90 group/btn"
                                    >
                                        <ChevronRight className="w-6 h-6 rotate-180" strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1);
                                        }}
                                        className="w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full shadow-lg border border-gray-100 text-black hover:bg-black hover:text-white transition-all pointer-events-auto transform hover:translate-x-1 active:scale-90 group/btn"
                                    >
                                        <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Brand & Identity Tags */}
                                <div className="absolute top-8 left-8 flex flex-col gap-2 z-30">
                                    <span className="bg-[#d4ff00] text-black text-[8px] font-black px-2 py-1 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Original / Identity</span>
                                    <span className="text-[8px] font-black text-black/30 uppercase tracking-[0.3em] bg-white/50 backdrop-blur-sm px-2 py-0.5 w-fit font-mono">View_0{activeImageIndex + 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: POSTER TYPOGRAPHY & HIGH CONTRAST INFO */}
                    <div className="lg:col-span-12 xl:col-span-4">
                        <div className="lg:sticky lg:top-36 space-y-12">
                            {/* Brand Poster Label */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-black" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black">Original Wear</span>
                                </div>
                                <div className="relative group/title flex items-start justify-between">
                                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-black italic max-w-[85%]">
                                        {product.name}
                                    </h1>
                                    <button
                                        onClick={handleToggleWishlist}
                                        className={cn(
                                            "mt-2 p-3 rounded-full transition-all duration-300 active:scale-90",
                                            isInWishlist
                                                ? "text-black bg-black/10"
                                                : "text-gray-300 hover:text-black hover:bg-black/5"
                                        )}
                                    >
                                        <Heart
                                            className={cn("w-8 h-8 transition-transform duration-500", isInWishlist && "fill-current animate-pulse-gentle")}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#d4ff00] rotate-45 flex items-center justify-center -z-10 opacity-20 group-hover/title:opacity-100 transition-opacity duration-500">
                                        <span className="text-black text-[8px] font-black -rotate-45 tracking-widest leading-none">FS24 / {product.sku?.slice(-2) || "01"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10 border-y border-gray-100 py-10">
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black tracking-tighter">₹{displayPrice.toLocaleString('en-IN')}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MRP Incl. of taxes</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Global Standard Price</p>
                                </div>
                                {originalPrice && originalPrice > displayPrice && (
                                    <div className="flex flex-col gap-0">
                                        <span className="text-lg text-gray-300 line-through font-bold leading-none">₹{originalPrice.toLocaleString('en-IN')}</span>
                                        <span className="text-2xl font-black text-black tracking-tighter">
                                            {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* EDITORIAL STORYTELLING DESCRIPTION */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-4 bg-black" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Product Specification Log</p>
                                </div>
                                <div className="relative">
                                    <p className="text-sm md:text-base font-bold text-gray-400 italic leading-relaxed tracking-tight">
                                        {product.description || "Experimental technical garment designed for maximum movement and visual impact. Part of the FS24 original series."}
                                    </p>
                                    <div className="absolute -left-4 top-0 w-px h-full bg-gray-50" />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-[0.2em]">Heavyweight_280GSM</span>
                                    <span className="px-3 py-1 border border-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-[0.2em]">Standard_Export_Grade</span>
                                </div>
                            </div>

                            {/* Options with Funky Elements */}
                            <div className="space-y-12">
                                {product.options.map((option: any) => (
                                    <div key={option.id} className="space-y-6">
                                        <div className="flex justify-between items-center bg-gray-50/50 px-4 py-2 border-l-2 border-black mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Select {option.name}</h3>
                                            {option.name.toLowerCase().includes('size') && (
                                                <button
                                                    onClick={() => setShowSizeChart(true)}
                                                    className="flex items-center gap-2 group/sg"
                                                >
                                                    <div className="w-2 h-2 bg-black rounded-full group-hover:scale-150 transition-transform animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest border-b border-black/10 group-hover:border-black group-hover:text-black transition-all">Sizing Guide</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {option.values.map((val: any) => (
                                                <button
                                                    key={val.id}
                                                    onClick={() => handleOptionSelect(option.name, val.value)}
                                                    className={cn(
                                                        "min-w-9 h-9 flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-300",
                                                        selectedOptions[option.name] === val.value
                                                            ? "bg-[#d4ff00] text-black rotate-6 scale-110 shadow-[0_0_20px_rgba(212,255,0,0.4)] border-none"
                                                            : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
                                                    )}
                                                >
                                                    {val.value}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Dispatch Info */}
                            <div className="bg-gray-50 p-6 space-y-2 border-l-4 border-black">
                                <p className="text-[11px] font-black uppercase tracking-widest text-black">Express Dispatch</p>
                                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
                                    Fast 1-2 day delivery on 5,000+ pincodes. Ships in 24 hours.
                                </p>
                            </div>

                            {/* Quantity & CTA Actions */}
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Quantity:</span>
                                    <div className="flex items-center border border-gray-100 bg-gray-50/50">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-black text-xs">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={selectedVariant && selectedVariant.quantity === 0}
                                        className="h-16 bg-white text-black border-2 border-black font-black uppercase tracking-[0.3em] text-[12px] rounded-none hover:bg-black hover:text-white group relative overflow-hidden active:scale-[0.98] transition-all"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-4">
                                            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                                            Add to Bag
                                        </span>
                                    </Button>

                                    <Button
                                        onClick={handleBuyNow}
                                        className="h-16 bg-[#d4ff00] text-black font-black uppercase tracking-[0.3em] text-[12px] rounded-none hover:bg-black hover:text-[#d4ff00] border-2 border-[#d4ff00] group relative overflow-hidden active:scale-[0.98] transition-all duration-500 shadow-[0_0_30px_rgba(212,255,0,0.2)]"
                                    >
                                        <span className="relative z-10">Buy It Now</span>
                                        <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out-expo" />
                                    </Button>
                                </div>

                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors w-fit border border-gray-100 px-4 py-2 bg-gray-50/50 active:scale-95"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share Catalog
                                </button>
                            </div>

                            {/* DETAILED INFORMATION ACCORDIONS */}
                            <div className="mt-12">
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="details" className="border-b border-gray-100">
                                        <AccordionTrigger className="hover:no-underline py-6">
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Product Information</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-8">
                                            <div className="space-y-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span>Composition</span>
                                                    <span className="text-black">100% Cotton / Heavyweight</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span>Color</span>
                                                    <span className="text-black">{product.name.split(' ')[0]} / Acid Tint</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span>Wash Care</span>
                                                    <span className="text-black">Machine Wash Cold / Gentle</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span>Country of Origin</span>
                                                    <span className="text-black">India / FS-Tech Hub</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span>Processing Time</span>
                                                    <span className="text-black">Ships within 24-48 Hours</span>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="shipping" className="border-b border-gray-100">
                                        <AccordionTrigger className="hover:no-underline py-6">
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Shipping & Returns</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-8">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                                Standard shipping delivery within 5-7 business days. 7-day hassle-free returns. Items must be in original condition with tags intact.
                                            </p>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="info" className="border-b border-gray-100">
                                        <AccordionTrigger className="hover:no-underline py-6">
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Additional Information</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-8">
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-1" />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colors may slightly vary depending on screen brightness.</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full mt-1" />
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aesthetic features intentional slight distressing.</p>
                                                </li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Sizing Guide Modal: Minimalist Pop-over */}
            <AnimatePresence>
                {showSizeChart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setShowSizeChart(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white max-w-xl w-full relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-gray-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-black p-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-black" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Technical Size Matrix</h3>
                                </div>
                                <button
                                    onClick={() => setShowSizeChart(false)}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-100 mb-4">
                                    {['SIZE', 'CHEST', 'LENGTH', 'SHOULDER'].map(label => (
                                        <span key={label} className="text-[8px] font-black uppercase text-gray-300 tracking-widest">{label}</span>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    {[
                                        { s: 'S', c: '42.0', l: '28.5', h: '20.5' },
                                        { s: 'M', c: '44.0', l: '29.5', h: '21.5' },
                                        { s: 'L', c: '46.0', l: '30.5', h: '22.5' },
                                        { s: 'XL', c: '48.0', l: '31.5', h: '23.5' },
                                        { s: 'XXL', c: '50.0', l: '32.5', h: '24.5' },
                                    ].map((row) => (
                                        <div key={row.s} className="group grid grid-cols-4 gap-4 py-3 hover:bg-gray-50/80 transition-all rounded px-2 -mx-2">
                                            <span className="text-sm font-black italic text-black group-hover:text-black transition-colors">{row.s}</span>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-black">{row.c}"</span>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-black">{row.l}"</span>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-black">{row.h}"</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
                                        *MEASUREMENTS IN INCHES. <br /> VARIATION +/- 0.5"
                                    </p>
                                    <div className="px-3 py-1 bg-gray-50 rounded text-[8px] font-black uppercase tracking-widest text-gray-400">
                                        SYST_VOL: FS24-A
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Similar Products: Lean Editorial Extension */}
            <div className="mt-48 pt-24 border-t border-gray-100">
                <div className="flex flex-col items-center gap-4 mb-20 text-center">
                    <span className="text-black text-[10px] font-black uppercase tracking-[0.6em]">Extend the movement</span>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                        YOU MAY ALSO <span className="italic text-gray-300">WANT</span>
                    </h2>
                </div>

                <SimilarProducts
                    slug={product.slug}
                    categories={product.categories}
                />
            </div>
        </div>
    )
}



function LookbookHeroImage({ src, name, index, isZoomed }: { src: string, name: string, index: number, isZoomed: boolean }) {
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0, px: 50, py: 50 })
    const [isHovered, setIsHovered] = React.useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMousePos({
            x,
            y,
            px: (x / rect.width) * 100,
            py: (y / rect.height) * 100
        })
    }

    const imageSrc = src || "/placeholder.jpg"

    return (
        <div
            className="relative w-full h-full overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="relative w-full h-full transition-transform duration-500 ease-out pointer-events-none"
                style={{
                    transform: isZoomed ? `scale(2.5)` : `scale(1)`,
                    transformOrigin: `${mousePos.px}% ${mousePos.py}%`
                }}
            >
                <Image
                    src={imageSrc}
                    alt={`${name} perspective ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </div>

            {/* Technical Loupe Effect */}
            <motion.div
                animate={{
                    opacity: isHovered ? 1 : 0,
                    x: mousePos.x - 75,
                    y: mousePos.y - 75,
                    scale: isHovered ? 1 : 0.8
                }}
                transition={{ type: "spring", damping: 35, stiffness: 250, mass: 0.4 }}
                className="absolute top-0 left-0 w-[150px] h-[150px] border border-white/40 rounded-full pointer-events-none z-20 flex items-center justify-center overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                <div className="relative flex flex-col items-center">
                    <div className="w-8 h-[1px] bg-white/60 mb-1" />
                    <span className="text-[7px] font-black text-white uppercase tracking-[0.4em]">Detail_Focus</span>
                </div>
            </motion.div>
        </div>
    )
}

function PDPLoading() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading</span>
            </div>
        </div>
    )
}
