"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/store/use-cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function CartDrawer() {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="relative p-2 hover:bg-white/10 transition-colors">
                    <ShoppingBag className="w-6 h-6" />
                    {getTotalItems() > 0 && (
                        <span className="absolute -top-1 -right-1 bg-neon-green text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-none border-2 border-black -rotate-12">
                            {getTotalItems()}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-deep-black border-l-2 border-charcoal text-white p-0 flex flex-col">
                <SheetHeader className="p-6 border-b-2 border-charcoal">
                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic">
                        YOUR <span className="text-neon-green">BAG</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-grow overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 bg-charcoal border-2 border-dashed border-muted-foreground flex items-center justify-center">
                                <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-20" />
                            </div>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Your bag is empty</p>
                            <Button variant="outline" className="rounded-none border-2 border-white uppercase font-black hover:bg-neon-green hover:text-black">
                                Shop Arrivals
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={`${item.id}-${item.variantId}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-4 group"
                                    >
                                        <div className="relative w-24 aspect-[3/4] bg-charcoal border border-charcoal overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black uppercase tracking-tight text-sm group-hover:text-neon-green transition-colors">
                                                    {item.name}
                                                </h4>
                                                <button
                                                    onClick={() => removeItem(item.id, item.variantId)}
                                                    className="text-muted-foreground hover:text-electric-pink transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.options && Object.entries(item.options).map(([key, value]) => (
                                                    <span key={key} className="text-[8px] font-black uppercase tracking-widest bg-charcoal px-2 py-1">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center border border-charcoal">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)}
                                                        className="p-2 hover:text-neon-green"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)}
                                                        className="p-2 hover:text-neon-green"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="font-black">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t-2 border-charcoal bg-charcoal/50 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                            <span className="text-2xl font-black">${getTotalPrice().toFixed(2)}</span>
                        </div>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <Link href="/checkout" className="w-full">
                                <Button className="h-16 w-full bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all">
                                    Secure Checkout
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
