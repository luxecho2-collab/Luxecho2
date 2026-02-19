"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    Search,
    Bell,
    ChevronRight,
    FolderPlus,
    Tag as TagIcon
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

export default function AdminDashboard() {
    const { data: stats, isLoading } = api.admin.getStats.useQuery(undefined)
    const { data: orders, isLoading: ordersLoading } = api.admin.getOrders.useQuery({ take: 5 })

    const cards = [
        { name: "NET REVENUE", value: `₹${stats?.totalRevenue.toLocaleString('en-IN') ?? "0.00"}`, icon: TrendingUp, positive: true },
        { name: "ACTIVE ORDERS", value: stats?.totalOrders ?? 0, icon: ShoppingBag, positive: true },
        { name: "CLIENT BASE", value: stats?.totalUsers ?? 0, icon: Users, positive: true },
        { name: "INVENTORY ALERTS", value: stats?.lowStockCount ?? 0, icon: AlertTriangle, positive: false },
    ]

    return (
        <div className="flex min-h-screen bg-white text-black">
            {/* Main Content Area */}
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            DASHBOARD <span className="text-gray-200">OVERVIEW</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                            Real-time Store Performance Metrics
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-none border-gray-100 h-12 w-12 p-0 hover:bg-black hover:text-white transition-all">
                            <Search className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="rounded-none border-gray-100 h-12 w-12 p-0 hover:bg-black hover:text-white transition-all">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Link href="/admin/products/new">
                            <Button className="rounded-none bg-black text-white h-12 px-8 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-none border border-black">
                                New Item
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Stats Grid - High Contrast Premium Look */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card) => (
                        <div key={card.name} className="relative group overflow-hidden border border-gray-50 bg-white p-10 hover:border-black transition-all duration-500">
                            <div className="absolute top-0 right-0 w-2 h-0 bg-black group-hover:h-full transition-all duration-700" />
                            <div className="relative space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="w-10 h-10 bg-gray-50 flex items-center justify-center group-hover:bg-black transition-colors duration-500">
                                        <card.icon className="w-4 h-4 text-black group-hover:text-white transition-colors duration-500" />
                                    </div>
                                    <div className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-2 py-1",
                                        card.positive ? "bg-black text-white" : "bg-gray-100 text-black border border-gray-200"
                                    )}>
                                        {card.positive ? "+12.5%" : "Action Required"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{card.name}</p>
                                    <p className="text-4xl font-black tracking-tighter tabular-nums">
                                        {isLoading ? "0.00" : card.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-10">
                    {/* Recent Order Manifest */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight">Recent Orders</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Latest Store Activity</p>
                            </div>
                            <Link href="/admin/orders">
                                <Button variant="link" className="text-black font-black uppercase text-[10px] tracking-widest hover:no-underline flex items-center gap-2 group p-0">
                                    All Orders <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-1 border border-gray-50 p-2">
                            {ordersLoading ? (
                                <div className="py-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Synchronizing Data...</div>
                            ) : orders?.length === 0 ? (
                                <div className="py-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">No active orders found.</div>
                            ) : orders?.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="text-[10px] font-black text-gray-300 tabular-nums">
                                            #{order.orderNumber.slice(-4)}
                                        </div>
                                        <div>
                                            <p className="font-black uppercase text-xs tracking-tight group-hover:translate-x-1 transition-transform">{order.user?.name || "ANONYMOUS CLIENT"}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                {order.status} • {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-sm tabular-nums tracking-tighter">₹{order.total.toLocaleString('en-IN')}</p>
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic mt-0.5">Verified</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Equilibrium */}
                    <div className="space-y-10">
                        <div className="border-b border-gray-100 pb-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight">Inventory</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Stock Status</p>
                        </div>
                        <div className="space-y-10 p-8 border border-gray-50">
                            {isLoading ? (
                                <div className="py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Calculating...</div>
                            ) : stats?.lowStockProducts.length === 0 ? (
                                <div className="py-12 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Reserves are optimal.</div>
                            ) : stats?.lowStockProducts.map((product) => (
                                <div key={product.id} className="group">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                        <span className="text-gray-400 group-hover:text-black transition-colors">{product.name}</span>
                                        <span className="text-black">{product.quantity} UNITS</span>
                                    </div>
                                    <div className="h-[2px] w-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full bg-black transition-all duration-1000"
                                            style={{ width: `${Math.max((product.quantity / 5) * 100, 10)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Link href="/admin/products" className="block pt-4">
                                <Button className="w-full bg-black text-white border border-black font-black uppercase text-[10px] tracking-widest h-14 hover:bg-gray-900 transition-all duration-500 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                                    Restock Items
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
