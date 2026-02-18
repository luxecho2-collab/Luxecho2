"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useCart } from "@/store/use-cart"

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug: string
        price: any
        compareAtPrice?: any
        images: { url: string; alt?: string | null }[]
        category?: { name: string } | null
        status?: string
    }
    className?: string
    priority?: boolean
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const addItem = useCart((state) => state.addItem)
    const utils = api.useUtils()
    const [isHovered, setIsHovered] = React.useState(false)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    React.useEffect(() => {
        let interval: NodeJS.Timeout
        if (isHovered && product.images.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
            }, 1200)
        } else {
            setCurrentImageIndex(0)
        }
        return () => clearInterval(interval)
    }, [isHovered, product.images.length])

    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    const isInWishlist = wishlist?.some((item) => item.productId === product.id)

    const { mutate: toggleWishlist, isPending: isToggling } = api.account.toggleWishlist.useMutation({
        onSuccess: (data) => {
            void utils.account.getWishlist.invalidate()
            toast({
                title: data.added ? "Added to Wishlist" : "Removed from Wishlist",
                description: `${product.name} has been ${data.added ? "added to" : "removed from"} your wishlist.`,
            })
        },
    })

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!session) {
            router.push("/api/auth/signin")
            return
        }
        toggleWishlist({ productId: product.id })
    }

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            image: product.images[0]?.url || "/placeholder.jpg",
            quantity: 1,
        })
        toast({ title: "Added to Bag", description: `${product.name} added.` })
    }

    const price = Number(product.price)
    const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null
    const hasDiscount = comparePrice && comparePrice > price
    const discount = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn("group block relative w-full", className)}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-white group-hover:shadow-2xl transition-shadow duration-700">
                <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={product.images[currentImageIndex]?.url || "/placeholder.jpg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                                priority={priority}
                            />
                        </motion.div>
                    </AnimatePresence>
                </Link>

                {/* Badges - Top Left */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {hasDiscount && (
                        <div className="bg-[#E42327] text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-tight shadow-lg">
                            SAVE {discount}%
                        </div>
                    )}
                </div>

                {/* Diagonal Ribbon - Top Right */}
                {product.status === 'ACTIVE' && (
                    <div className="absolute top-0 right-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
                        <div className="bg-[#00B4FF] text-white text-[9px] font-black uppercase tracking-widest py-1.5 w-32 text-center absolute top-7 -right-7 rotate-45 shadow-md">
                            New Drop
                        </div>
                    </div>
                )}

                {/* Wishlist - Top Right (below ribbon) */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={isToggling}
                    className="absolute top-4 right-4 z-20 transition-transform duration-300 hover:scale-110 active:scale-90"
                >
                    <Heart
                        className={cn(
                            "w-5 h-5 transition-all duration-300",
                            isInWishlist ? "fill-red-500 text-red-500" : "text-black drop-shadow-md"
                        )}
                        strokeWidth={isInWishlist ? 0 : 2}
                    />
                </button>

                {/* Unique Hover Info Tag (Pill Tag) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 10, x: "-50%" }}
                            className="absolute left-1/2 top-1/2 z-20 pointer-events-none"
                        >
                            <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-2xl rounded-full border border-white/10">
                                {product.name}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Add Tray */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out-expo z-20">
                    <button
                        onClick={handleQuickAdd}
                        className="w-full h-12 bg-black text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors shadow-2xl"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Quick Add
                    </button>
                </div>
            </div>

            {/* Visual Footer (The "Unique Of Yourself" Part) */}
            <div className="mt-4 flex justify-between items-end">
                <div className="space-y-1">
                    {product.category && (
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">
                            {product.category.name}
                        </p>
                    )}
                    <h3 className="text-xs font-black uppercase tracking-tighter leading-none line-clamp-1">
                        {product.name}
                    </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-black text-black leading-none">₹{price.toLocaleString('en-IN')}</span>
                    {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through font-bold leading-none">₹{comparePrice?.toLocaleString('en-IN')}</span>
                    )}
                </div>
            </div>
            {/* Immersive bottom border decoration */}
            <div className="h-[1px] w-full bg-gray-100 mt-4 group-hover:bg-black transition-colors duration-500" />
        </motion.div>
    )
}
