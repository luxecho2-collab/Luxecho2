"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    Package,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AuthPortal } from "@/components/auth/auth-portal"

export default function OrdersPage() {
    const { data: session, status } = useSession()
    const { data: orders, isLoading } = api.account.getOrders.useQuery(undefined, {
        enabled: !!session,
    })

    if (status === "loading" || isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase italic">Retrieving Deployment Logs...</div>
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-neon-green" />
            case "SHIPPED": return <Truck className="w-4 h-4 text-white" />
            case "PROCESSING": return <Clock className="w-4 h-4 text-white" />
            default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 space-y-4">
                <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sector 07
                </Link>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">ORDER <span className="text-neon-green">HISTORY</span></h1>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="py-24 text-center border-4 border-dashed border-charcoal bg-charcoal/20">
                    <Package className="w-16 h-16 text-charcoal mx-auto mb-4" />
                    <h2 className="text-2xl font-black uppercase italic text-muted-foreground">No Deployments Detected</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Your field record is currently empty.</p>
                    <Link href="/products">
                        <Button className="mt-8 bg-neon-green text-black font-black uppercase rounded-none h-12 px-8">Acquire Gear</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-charcoal border-2 border-charcoal hover:border-white transition-all group overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-black/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-charcoal">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Order Ref</p>
                                    <p className="font-black text-white tabular-nums">#{order.orderNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Deployed On</p>
                                    <p className="font-black text-white">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Credit</p>
                                    <p className="font-black text-neon-green">${order.total.toFixed(2)}</p>
                                </div>
                                <div className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest",
                                    order.status === "DELIVERED" ? "bg-neon-green/10 text-neon-green" : "bg-white/10 text-white"
                                )}>
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </div>
                            </div>

                            {/* Order Items & Actions */}
                            <div className="p-6 flex flex-col md:flex-row justify-between items-end gap-8">
                                <div className="flex flex-wrap gap-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="relative w-16 aspect-[3/4] bg-deep-black border-2 border-charcoal group-hover:border-white/20 transition-colors">
                                            {item.product.images[0] && (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                            <div className="absolute -bottom-2 -right-2 bg-neon-green text-black text-[8px] font-black px-1.5 py-0.5 z-10">
                                                x{item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link href={`/order-tracking/${order.id}`} className="w-full md:w-auto">
                                    <Button variant="outline" className="w-full md:w-auto rounded-none border-2 border-white hover:bg-white hover:text-black uppercase font-black text-[10px] tracking-widest h-12 px-8">
                                        Track Deployment
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
