"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useCart } from "@/store/use-cart"

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get("id")
    const { clearCart } = useCart()

    React.useEffect(() => {
        if (orderId) {
            clearCart()
        }
    }, [orderId, clearCart])

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">

            {/* Animated check mark */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                className="w-24 h-24 bg-black flex items-center justify-center mb-10"
            >
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
            </motion.div>

            {/* Headline */}
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-center space-y-4 mb-10"
            >
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-black leading-none">
                    Payment<br />
                    <span className="text-black/20">Confirmed</span>
                </h1>
                <p className="text-sm text-black/50 font-medium max-w-sm mx-auto leading-relaxed">
                    Your transaction was successful. We are now prepping your order for delivery.
                </p>
            </motion.div>

            {/* Order reference box */}
            {orderId && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.45 }}
                    className="border border-black/10 bg-gray-50 px-10 py-6 text-center mb-10 w-full max-w-sm"
                >
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-2">
                        Order Reference
                    </p>
                    <p className="text-2xl font-black text-black tracking-wider tabular-nums">
                        #{orderId.slice(-8).toUpperCase()}
                    </p>
                </motion.div>
            )}

            {/* CTA buttons */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.45 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-10"
            >
                <Link href="/products" className="flex-1">
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-none border border-black/20 text-black font-black uppercase tracking-widest text-xs hover:bg-black/5 transition-all gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                    </Button>
                </Link>
                <Link href="/account/orders" className="flex-1">
                    <Button
                        className="w-full h-14 rounded-none bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-black/90 transition-all gap-2"
                    >
                        View Order Status
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </motion.div>

            {/* Trust badge */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30"
            >
                <Package className="w-3.5 h-3.5" />
                Secure Fulfillment Guaranteed
            </motion.div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <React.Suspense
            fallback={
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-black uppercase tracking-widest text-black/40">Processing Order...</p>
                    </div>
                </div>
            }
        >
            <OrderSuccessContent />
        </React.Suspense>
    )
}
