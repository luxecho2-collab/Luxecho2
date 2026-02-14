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
    Box
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    // We should create a public order tracking procedure in productRouter or a new trackingRouter
    // For now, let's use account.getOrder if the user is logged in, or assume we'll add public tracking later
    const { data: order, isLoading } = api.account.getOrders.useQuery() // Simplified for demo

    // Find the specific order from the list (In a real app, use a dedicated getOrder public procedure)
    const currentOrder = order?.find(o => o.id === params.id)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Box className="w-12 h-12 text-neon-green mx-auto animate-bounce" />
                    <p className="font-black uppercase italic tracking-widest text-neon-green">Syncing Neural Grid...</p>
                </div>
            </div>
        )
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="text-center space-y-8 max-w-sm">
                    <h1 className="text-6xl font-black uppercase italic tracking-tighter">DATA <span className="text-electric-pink">VOID</span></h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
                        The requested deployment coordinate does not exist in our neural archive.
                    </p>
                    <Link href="/">
                        <Button className="w-full h-16 bg-white text-black font-black uppercase tracking-widest rounded-none shadow-[8px_8px_0px_#FF0055]">
                            Return to Base
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const steps = [
        { status: "PENDING", label: "Initialization", icon: Clock, desc: "Order details received and verified." },
        { status: "PROCESSING", label: "Neutral Prep", icon: Box, desc: "Gear is being sanitized and packed." },
        { status: "SHIPPED", label: "Deployment", icon: Truck, desc: "Order has left the central hub." },
        { status: "DELIVERED", label: "Extraction", icon: CheckCircle2, desc: "Gear has reached your coordinate." },
    ]

    const currentIndex = steps.findIndex(s => s.status === currentOrder.status)

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-4 border-white/5 pb-12">
                <div className="space-y-4">
                    <Link href="/account/orders" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Logs
                    </Link>
                    <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">
                        DEPLOY <span className="text-neon-green">TRACK</span>
                    </h1>
                </div>
                <div className="p-6 bg-charcoal border-2 border-charcoal hover:border-neon-green transition-all">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">DEPLOYMENT ID</p>
                    <p className="text-2xl font-black tabular-nums italic text-neon-green">{currentOrder.orderNumber}</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
                {/* Timeline Vector */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="relative space-y-12">
                        {steps.map((step, index) => (
                            <div key={step.status} className="flex gap-8 group">
                                <div className="relative flex flex-col items-center">
                                    <div className={cn(
                                        "w-12 h-12 border-4 flex items-center justify-center z-10 transition-all duration-500",
                                        index <= currentIndex ? "border-neon-green bg-black text-neon-green shadow-[0_0_15px_rgba(0,255,65,0.3)]" : "border-charcoal bg-black text-muted-foreground"
                                    )}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            "w-1 h-20 -my-2 transition-colors duration-1000",
                                            index < currentIndex ? "bg-neon-green" : "bg-charcoal"
                                        )} />
                                    )}
                                </div>
                                <div className="pt-2 space-y-2">
                                    <h3 className={cn(
                                        "text-2xl font-black uppercase italic tracking-tighter transition-colors",
                                        index <= currentIndex ? "text-white" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-sm">
                                        {step.desc}
                                    </p>
                                    {index === currentIndex && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green/10 border border-neon-green text-neon-green text-[8px] font-black uppercase tracking-widest mt-4">
                                            Current Phase
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="space-y-8 lg:sticky lg:top-32">
                    <div className="bg-charcoal p-8 border-2 border-charcoal space-y-6">
                        <h4 className="font-black uppercase italic tracking-widest text-xs border-b-2 border-black pb-4">COORDINATES</h4>
                        <div className="flex gap-4">
                            <MapPin className="w-5 h-5 text-neon-green mt-1 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="font-black text-sm uppercase italic">Extraction Point</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    {(currentOrder.shippingAddress as any).street}<br />
                                    {(currentOrder.shippingAddress as any).city}, {(currentOrder.shippingAddress as any).zip}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-charcoal p-8 border-2 border-charcoal space-y-6">
                        <h4 className="font-black uppercase italic tracking-widest text-xs border-b-2 border-black pb-4">CARRIER INTEL</h4>
                        <div className="flex gap-4">
                            <ShieldCheck className="w-5 h-5 text-cyber-blue mt-1 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="font-black text-sm uppercase italic">Cyber-Courier V1</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                                    Estimated Delivery:<br />
                                    {format(new Date(currentOrder.createdAt), "MMMM dd, yyyy")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-20 bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-xl shadow-[8px_8px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        URGENT ENQUIRY
                    </Button>
                </div>
            </div>
        </div>
    )
}
