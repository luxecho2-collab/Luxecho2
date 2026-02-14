"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
    const { data: session, status } = useSession()
    const { data: wishlist, isLoading } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    if (status === "loading" || isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase italic">Scanning Neural Archive...</div>
    }

    if (!session) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-black uppercase italic mb-8 text-electric-pink">Access Forbidden</h1>
                <Link href="/api/auth/signin">
                    <Button className="bg-white text-black font-black uppercase tracking-widest rounded-none h-16 px-12">Login to Sync</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 space-y-4">
                <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sector 07
                </Link>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">THE <span className="text-neon-green">WISHLIST</span></h1>
            </div>

            {!wishlist || wishlist.length === 0 ? (
                <div className="py-24 text-center border-4 border-dashed border-charcoal bg-charcoal/20">
                    <Heart className="w-16 h-16 text-charcoal mx-auto mb-4" />
                    <h2 className="text-2xl font-black uppercase italic text-muted-foreground">Archive Empty</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">No target gear saved to your record.</p>
                    <Link href="/products">
                        <Button className="mt-8 bg-neon-green text-black font-black uppercase rounded-none h-12 px-8">Scan Catalog</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                    {wishlist.map((item: any) => (
                        <ProductCard key={item.id} product={item.product as any} />
                    ))}
                </div>
            )}
        </div>
    )
}
