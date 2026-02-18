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
            {/* Minimalist Admin Sidebar */}
            <aside className="w-72 border-r border-gray-100 bg-white hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-10 border-b border-gray-50 flex items-center gap-3">
                    <LuxechoLogo size={28} />
                    <span className="text-sm font-black uppercase tracking-[0.4em]">
                        Admin
                    </span>
                </div>
                <nav className="p-6 flex-grow flex flex-col gap-1">
                    {[
                        { name: "Dashboard Overview", icon: LayoutDashboard, href: "/admin", active: true },
                        { name: "Product Catalog", icon: Package, href: "/admin/products" },
                        { name: "Category Matrix", icon: FolderPlus, href: "/admin/categories" },
                        { name: "Filter Attributes", icon: TagIcon, href: "/admin/attributes" },
                        { name: "Orders & Fulfillment", icon: ShoppingBag, href: "/admin/orders" },
                        { name: "Customer Relations", icon: Users, href: "/admin/customers" },
                    ].map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase tracking-widest gap-4 px-6 transition-all duration-300",
                                    item.active
                                        ? "bg-acid-green text-black hover:bg-acid-green hover:text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                                        : "text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-300"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[10px]">{item.name}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>
                <div className="p-8 border-t border-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">VK</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Administrator</p>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Superuser Access</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            COMMAND <span className="text-gray-200">CENTER</span>
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
                            <Button className="rounded-none bg-acid-green text-black h-12 px-8 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#000] hover:shadow-none border-2 border-black">
                                New Entry
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
                                    <div className="w-10 h-10 bg-gray-50 flex items-center justify-center group-hover:bg-acid-green transition-colors duration-500">
                                        <card.icon className="w-4 h-4 text-black group-hover:text-black transition-colors duration-500" />
                                    </div>
                                    <div className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-2 py-1",
                                        card.positive ? "bg-acid-green text-black" : "bg-gray-100 text-black border border-gray-200"
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
                                <h2 className="text-3xl font-black uppercase tracking-tight">Recent Manifests</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Latest Order Stream</p>
                            </div>
                            <Link href="/admin/orders">
                                <Button variant="link" className="text-black font-black uppercase text-[10px] tracking-widest hover:no-underline flex items-center gap-2 group p-0">
                                    Full Ledger <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-1 border border-gray-50 p-2">
                            {ordersLoading ? (
                                <div className="py-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Syncing Encrypted Streams...</div>
                            ) : orders?.length === 0 ? (
                                <div className="py-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">No active manifests found.</div>
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
                            <h2 className="text-3xl font-black uppercase tracking-tight">Equilibrium</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Inventory Balance</p>
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
                                            className="h-full bg-acid-green transition-all duration-1000 shadow-[0_0_10px_rgba(212,255,0,0.5)]"
                                            style={{ width: `${Math.max((product.quantity / 5) * 100, 10)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            <Link href="/admin/products" className="block pt-4">
                                <Button className="w-full bg-acid-green text-black border-2 border-black font-black uppercase text-[10px] tracking-widest h-14 hover:bg-black hover:text-acid-green transition-all duration-500 rounded-none shadow-[4px_4px_0px_#000]">
                                    Restock Inventory
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
