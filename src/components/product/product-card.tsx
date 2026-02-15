"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug: string
        price: any // Decimal
        compareAtPrice?: any // Decimal
        images: { url: string; alt?: string | null }[]
        category?: { name: string } | null
    }
    className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { data: session } = useSession()
    const { toast } = useToast()
    const router = useRouter()
    const utils = api.useUtils()

    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    const isInWishlist = wishlist?.some((item) => item.productId === product.id)

    const { mutate: toggleWishlist, isPending: isToggling } = api.account.toggleWishlist.useMutation({
        onSuccess: (data) => {
            void utils.account.getWishlist.invalidate()
            toast({
                title: data.added ? "Added to Wishlist" : "Removed from Wishlist",
                description: `${product.name} has been ${data.added ? "added to" : "removed from"} your archive.`,
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
        toggleWishlist({ productId: product.id })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn("group", className)}
        >
            <Link
                href={`/product/${product.slug}`}
                className="block relative aspect-[3/4] overflow-hidden bg-charcoal mb-6 border-2 border-transparent group-hover:border-neon-green transition-colors duration-300"
            >
                {product.images[0] && (
                    <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                )}

                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                        size="icon"
                        className={cn(
                            "bg-white text-black rounded-none transition-all duration-300",
                            isInWishlist
                                ? "bg-neon-green text-black hover:bg-electric-pink hover:text-white hover:scale-110"
                                : "hover:bg-neon-green hover:scale-110"
                        )}
                        onClick={(e) => {
                            e.preventDefault()
                            handleToggleWishlist()
                        }}
                        disabled={isToggling}
                    >
                        <Heart className={cn(
                            "w-5 h-5 transition-transform duration-300 group-active:scale-90",
                            isInWishlist && "fill-current"
                        )} />
                    </Button>
                    <Button size="icon" className="bg-white text-black hover:bg-neon-green rounded-none">
                        <ShoppingBag className="w-5 h-5" />
                    </Button>
                </div>

                {/* Badge if Sale */}
                {product.compareAtPrice && (
                    <div className="absolute top-4 left-4 bg-electric-pink text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 -skew-x-12">
                        SALE
                    </div>
                )}
            </Link>

            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Link href={`/product/${product.slug}`}>
                            <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-neon-green transition-colors">
                                {product.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest text-[10px]">
                            {product.category?.name}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-lg">${product.price.toString()}</p>
                        {product.compareAtPrice && (
                            <p className="text-xs text-muted-foreground line-through font-bold">
                                ${product.compareAtPrice.toString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="w-0 h-1 bg-neon-green group-hover:w-full transition-all duration-500" />
            </div>
        </motion.div>
    )
}
