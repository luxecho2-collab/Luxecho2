"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    ShoppingBag,
    ArrowLeft,
    Search,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    Eye
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function AdminOrdersPage() {
    const { data: orders, isLoading } = api.admin.getOrders.useQuery({ take: 50 })

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-neon-green" />
            case "SHIPPED": return <Truck className="w-4 h-4 text-cyber-blue" />
            case "PROCESSING": return <Clock className="w-4 h-4 text-white" />
            case "CANCELLED": return <XCircle className="w-4 h-4 text-electric-pink" />
            default: return <Clock className="w-4 h-4 text-muted-foreground" />
        }
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <aside className="w-64 border-r-4 border-black bg-charcoal hidden lg:flex flex-col">
                <div className="p-8 border-b-4 border-black">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        ADM <span className="text-neon-green">/ HUB</span>
                    </span>
                </div>
                <nav className="p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2 border-transparent text-muted-foreground hover:text-white">
                            DASHBOARD
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2 border-transparent text-muted-foreground hover:text-white">
                            PRODUCTS
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button variant="ghost" className="w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2 border-neon-green bg-black text-white">
                            ORDERS
                        </Button>
                    </Link>
                </nav>
            </aside>

            <main className="flex-grow p-8 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-4 border-white/5 pb-8">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Command Center
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                            DEPLOYMENT <span className="text-neon-green">/ LOGS</span>
                        </h1>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="SEARCH BY ORDER REF OR OPERATIVE..."
                        className="bg-charcoal border-2 border-black focus:border-neon-green rounded-none h-14 pl-12 font-bold uppercase italic tracking-widest"
                    />
                </div>

                <div className="border-4 border-black bg-charcoal overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b-2 border-black">
                                <th className="p-6">ORDER REF</th>
                                <th className="p-6">OPERATIVE</th>
                                <th className="p-6">DATE</th>
                                <th className="p-6">TOTAL</th>
                                <th className="p-6">STATUS</th>
                                <th className="p-6">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-24 text-center font-black uppercase italic animate-pulse">Synchronizing Satellite Logs...</td></tr>
                            ) : orders?.map((order: any) => (
                                <tr key={order.id} className="border-b-2 border-black/20 hover:bg-black/20 transition-colors group">
                                    <td className="p-6">
                                        <span className="font-black tabular-nums tracking-tighter uppercase group-hover:text-neon-green transition-colors">#{order.orderNumber}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase text-xs">{order.user?.name || "GUEST"}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-xs uppercase tracking-widest">{format(new Date(order.createdAt), "MMM dd, yyyy")}</td>
                                    <td className="p-6 font-black tabular-nums text-neon-green">${order.total.toFixed(2)}</td>
                                    <td className="p-6">
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 text-[8px] font-black uppercase tracking-widest w-fit border",
                                            order.status === "DELIVERED" ? "border-neon-green text-neon-green bg-neon-green/10" : "border-white/20 text-white"
                                        )}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <Button variant="outline" className="border-2 border-white/20 rounded-none hover:border-white font-black uppercase text-[10px] tracking-widest gap-2">
                                            <Eye className="w-4 h-4" /> INSPECT
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
