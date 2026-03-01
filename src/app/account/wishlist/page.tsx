"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { AuthPortal } from "@/components/auth/auth-portal"

export default function WishlistPage() {
    const { data: session, status } = useSession()
    const { data: wishlist, isLoading } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session,
    })

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-black">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="mb-12 space-y-4">
                    <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">My <span className="text-gray-400">Wishlist</span></h1>
                </div>

                {!wishlist || wishlist.length === 0 ? (
                    <div className="py-24 text-center border-4 border-dashed border-gray-100 bg-white italic">
                        <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-400">Archived Items</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mt-2">You haven't saved any items yet.</p>
                        <Link href="/products">
                            <Button className="mt-8 bg-black text-white hover:bg-gray-800 rounded-none h-12 px-8 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Browse Catalog
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                        {wishlist.map((item: any) => (
                            <ProductCard
                                key={item.id}
                                product={item.product as any}
                                savedSize={(item.options as any)?.Size || null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
