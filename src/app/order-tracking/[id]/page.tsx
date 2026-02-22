"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    ArrowLeft,
    ShieldCheck,
    Box,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    // In a real app, use a dedicated public getOrder procedure.
    // For now, we fetch all orders and find the matching one.
    const { data: orders, isLoading } = api.account.getOrders.useQuery()
    const currentOrder = orders?.find(o => o.id === params.id)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-8 text-black italic">
                <div className="text-center space-y-8 max-w-sm">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter">Order <span className="text-gray-400">NotFound</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed">
                        We couldn't find the order tracking details you're looking for.
                    </p>
                    <Link href="/account/orders">
                        <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest rounded-none transition-all">
                            Back to Orders
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const steps = [
        { status: "PENDING", label: "Confirmed", icon: Clock, desc: "Your order has been received." },
        { status: "PROCESSING", label: "Processing", icon: Box, desc: "We're preparing your items." },
        { status: "SHIPPED", label: "Dispatched", icon: Truck, desc: "Your package is on its way." },
        { status: "DELIVERED", label: "Delivered", icon: CheckCircle2, desc: "Package has reached its destination." },
    ]

    const currentIndex = steps.findIndex(s => s.status === currentOrder.status)

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-black italic">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-12 border-b border-gray-100">
                    <div className="space-y-4">
                        <Link href="/account/orders" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Order History
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                            Track <span className="text-gray-400">Delivery</span>
                        </h1>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 shadow-sm transition-all hover:border-black">
                        <p className="text-[9px] font-bold uppercase text-gray-400 tracking-widest mb-1">Order Number</p>
                        <p className="text-xl font-black tabular-nums tracking-tight">#{currentOrder.orderNumber}</p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* Status Timeline */}
                    <div className="lg:col-span-2 bg-white p-10 border border-gray-100 shadow-sm space-y-12">
                        <div className="relative space-y-16">
                            {steps.map((step, index) => (
                                <div key={step.status} className="flex gap-10 group">
                                    <div className="relative flex flex-col items-center">
                                        <div className={cn(
                                            "w-14 h-14 border-2 flex items-center justify-center z-10 transition-all duration-500 rounded-full bg-white",
                                            index <= currentIndex ? "border-black text-black shadow-lg" : "border-gray-100 text-gray-300"
                                        )}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={cn(
                                                "w-[2px] h-20 -my-3 transition-colors duration-1000",
                                                index < currentIndex ? "bg-black" : "bg-gray-100"
                                            )} />
                                        )}
                                    </div>
                                    <div className="pt-2 space-y-2">
                                        <h3 className={cn(
                                            "text-2xl font-black uppercase tracking-tighter transition-colors",
                                            index <= currentIndex ? "text-black" : "text-gray-300"
                                        )}>
                                            {step.label}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed max-w-sm">
                                            {step.desc}
                                        </p>
                                        {index === currentIndex && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest mt-4">
                                                Current Stage
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details Sidebar */}
                    <div className="space-y-8 lg:sticky lg:top-8">
                        <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
                            <h4 className="font-black uppercase italic tracking-widest text-[10px] border-b border-gray-50 pb-4 text-gray-400">Shipping Destination</h4>
                            <div className="flex gap-4">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-black text-xs uppercase leading-tight">Delivery Address</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        {(currentOrder.shippingAddress as any).street}<br />
                                        {(currentOrder.shippingAddress as any).city}, {(currentOrder.shippingAddress as any).zip}<br />
                                        {(currentOrder.shippingAddress as any).country.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
                            <h4 className="font-black uppercase italic tracking-widest text-[10px] border-b border-gray-50 pb-4 text-gray-400">Shipping Intel</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <Package className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-black text-xs uppercase leading-tight">Delivery Status</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                            Estimated arrival:<br />
                                            {format(new Date(currentOrder.createdAt), "MMMM dd, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                {(currentOrder.trackingNumber || currentOrder.trackingUrl) && (
                                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                                        <Truck className="w-4 h-4 text-black mt-1 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <p className="font-black text-xs uppercase leading-tight">Tracking ID</p>
                                            <p className="text-[11px] font-bold text-black uppercase tracking-widest bg-gray-50 px-2 py-1 inline-block">
                                                {currentOrder.trackingNumber || "N/A"}
                                            </p>
                                            {currentOrder.trackingUrl && (
                                                <Link href={currentOrder.trackingUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800">
                                                        Track via Courier <ChevronRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button className="w-full h-14 bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest rounded-none shadow-md transition-all flex items-center justify-center gap-3">
                            Contact Support <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
