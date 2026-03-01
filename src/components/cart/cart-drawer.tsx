"use strict"
"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/store/use-cart"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function CartDrawer({ isTransparent = false }: { isTransparent?: boolean }) {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const totalItems = mounted ? getTotalItems() : 0

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className={cn(
                    "relative flex items-center justify-center p-2 transition-all duration-300 rounded-full active:scale-95",
                    isTransparent
                        ? "text-white hover:bg-white/20 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                        : "text-brand-charcoal hover:bg-black/5"
                )}>
                    <ShoppingBag className={cn(isTransparent ? "w-7 h-7" : "w-6 h-6")} strokeWidth={isTransparent ? 2.5 : 1.5} />
                    {totalItems > 0 && (
                        <span className={cn(
                            "absolute -top-1 -right-1 text-[10px] sm:text-[11px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border shadow-sm",
                            isTransparent
                                ? "bg-white text-black border-transparent"
                                : "bg-black text-white border-white"
                        )}>
                            {totalItems}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-white border-l border-gray-200 text-black p-0 flex flex-col shadow-2xl">
                <VisuallyHidden><SheetTitle>Shopping Cart</SheetTitle></VisuallyHidden>
                <SheetHeader className="p-6 md:p-8 border-b border-gray-100 flex-shrink-0 relative overflow-hidden bg-gray-50/50">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <ShoppingBag className="w-32 h-32 -rotate-12" />
                    </div>
                    <div className="relative z-10 flex items-end justify-between">
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic leading-none">
                                Your <span className="text-gray-300">Bag</span>
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                {totalItems} {totalItems === 1 ? 'Item' : 'Items'} pending checkout
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse-gentle">
                            <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-full border border-gray-100">
                                <ShoppingBag className="w-10 h-10 text-gray-300" strokeWidth={1} />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="font-black uppercase tracking-[0.2em] text-sm text-black">Your bag is empty</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Construct your look.</p>
                            </div>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="mt-4 h-12 px-8 rounded-none border-gray-200 hover:border-black hover:bg-black hover:text-white uppercase font-black text-[10px] tracking-widest transition-all">
                                    Continue Shopping
                                </Button>
                            </SheetTrigger>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.variantId}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                        className="flex gap-5 group items-start"
                                    >
                                        <div className="relative w-24 aspect-[3/4] bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                        <div className="flex-grow flex flex-col h-full py-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold uppercase text-sm leading-tight line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                <button
                                                    onClick={() => removeItem(item.id, item.variantId)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-2 mb-4">
                                                {item.options && Object.entries(item.options).map(([key, value]) => (
                                                    <span key={key} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 text-gray-600">
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex justify-between items-center bg-gray-50 p-1 border border-gray-100">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" strokeWidth={3} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-white transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <p className="font-black text-sm pr-3">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="flex-shrink-0 p-6 md:p-8 border-t border-gray-100 bg-white space-y-6 relative z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end border-b border-gray-100 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Subtotal</span>
                                <span className="text-2xl font-black tracking-tighter">₹{getTotalPrice().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                Shipping and taxes calculated at checkout. Discount codes applied next.
                            </p>
                        </div>

                        <SheetTrigger asChild>
                            <a href="/checkout" className="block w-full">
                                <Button className="h-14 w-full bg-black text-white border-2 border-black hover:bg-white hover:text-black font-black uppercase tracking-[0.2em] rounded-none text-xs transition-all duration-300 group shadow-md flex items-center justify-between px-6">
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                                </Button>
                            </a>
                        </SheetTrigger>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
