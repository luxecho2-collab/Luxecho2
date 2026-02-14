"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("id")

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-charcoal border-4 border-neon-green p-8 md:p-16 text-center space-y-8 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 -rotate-45 translate-x-16 -translate-y-16" />

                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-neon-green/20 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-neon-green" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                        PAYMENT <span className="text-neon-green">CONFIRMED</span>
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-md mx-auto">
                        Your transaction was successful. Our drones are now prepping your gear for delivery.
                    </p>
                </div>

                {orderId && (
                    <div className="bg-deep-black p-6 border-2 border-charcoal space-y-2">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Order Reference</p>
                        <p className="text-xl font-black text-neon-green tabular-nums">#{orderId.slice(-8).toUpperCase()}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                    <Link href="/products">
                        <Button variant="outline" className="w-full h-16 rounded-none border-2 border-white text-white font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all">
                            Continue shopping
                        </Button>
                    </Link>
                    <Link href="/account/orders">
                        <Button className="w-full h-16 rounded-none bg-neon-green text-black font-black uppercase italic tracking-widest shadow-[8px_8px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                            View order status
                        </Button>
                    </Link>
                </div>

                <div className="pt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                    <Package className="w-4 h-4" />
                    Secure fulfillment guaranteed by FunkyStore
                </div>
            </motion.div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <React.Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center uppercase font-black italic">Decrypting Transaction...</div>}>
            <OrderSuccessContent />
        </React.Suspense>
    )
}
