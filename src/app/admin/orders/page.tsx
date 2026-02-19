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
            case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-gray-900" />
            case "SHIPPED": return <Truck className="w-4 h-4 text-gray-600" />
            case "PROCESSING": return <Clock className="w-4 h-4 text-gray-400" />
            case "CANCELLED": return <XCircle className="w-4 h-4 text-red-600" />
            default: return <Clock className="w-4 h-4 text-muted-foreground" />
        }
    }

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-gray-100 pb-10">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Center
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-black">
                            ORDER <span className="text-gray-200">HISTORY</span>
                        </h1>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="SEARCH ORDERS BY ID OR CUSTOMER..."
                        className="bg-charcoal border-2 border-black focus:border-white rounded-none h-14 pl-12 font-bold uppercase italic tracking-widest"
                    />
                </div>

                <div className="border-4 border-black bg-charcoal overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b-2 border-black">
                                <th className="p-6">ORDER ID</th>
                                <th className="p-6">CUSTOMER</th>
                                <th className="p-6">DATE</th>
                                <th className="p-6">TOTAL</th>
                                <th className="p-6">STATUS</th>
                                <th className="p-6">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-24 text-center font-black uppercase italic animate-pulse">Synchronizing Order Ledger...</td></tr>
                            ) : orders?.map((order: any) => (
                                <tr key={order.id} className="border-b-2 border-black/20 hover:bg-black/20 transition-colors group">
                                    <td className="p-6">
                                        <span className="font-black tabular-nums tracking-tighter uppercase group-hover:text-white transition-colors">#{order.orderNumber}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-black uppercase text-xs">{order.user?.name || "GUEST"}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-xs uppercase tracking-widest">{format(new Date(order.createdAt), "MMM dd, yyyy")}</td>
                                    <td className="p-6 font-black tabular-nums text-white">${order.total.toFixed(2)}</td>
                                    <td className="p-6">
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 text-[8px] font-black uppercase tracking-widest w-fit border",
                                            order.status === "DELIVERED" ? "border-white text-white bg-white/10" : "border-white/20 text-white"
                                        )}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <Button variant="outline" className="border-2 border-white/20 rounded-none hover:border-white font-black uppercase text-[10px] tracking-widest gap-2">
                                            <Eye className="w-4 h-4" /> DETAILS
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
