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
    Bell
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
    const { data: stats, isLoading } = api.admin.getStats.useQuery(undefined)

    const cards = [
        { name: "TOTAL REVENUE", value: `$${stats?.totalRevenue.toFixed(2) ?? "0.00"}`, icon: TrendingUp, color: "text-neon-green" },
        { name: "DEPLOYMENTS", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-cyber-blue" },
        { name: "OPERATIVES", value: stats?.totalUsers ?? 0, icon: Users, color: "text-electric-pink" },
        { name: "LOW STOCK", value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, color: "text-yellow-400" },
    ]

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r-4 border-black bg-charcoal hidden lg:flex flex-col">
                <div className="p-8 border-b-4 border-black">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        ADM <span className="text-neon-green">/ HUB</span>
                    </span>
                </div>
                <nav className="p-4 flex-grow space-y-2">
                    {[
                        { name: "DASHBOARD", icon: LayoutDashboard, href: "/admin", active: true },
                        { name: "PRODUCTS", icon: Package, href: "/admin/products" },
                        { name: "ORDERS", icon: ShoppingBag, href: "/admin/orders" },
                        { name: "CUSTOMERS", icon: Users, href: "/admin/customers" },
                    ].map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2",
                                    item.active ? "border-neon-green bg-black text-white" : "border-transparent text-muted-foreground hover:text-white"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", item.active ? "text-neon-green" : "")} />
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-8 space-y-12">
                <header className="flex justify-between items-end border-b-4 border-white/5 pb-8">
                    <div className="space-y-2">
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                            COMMAND <span className="text-neon-green">/ CENTER</span>
                        </h1>
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
                            OVERWATCH PROTOCOL ACTIVE
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-none border-2 border-white/20 h-12 w-12 p-0">
                            <Search className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" className="rounded-none border-2 border-white/20 h-12 w-12 p-0">
                            <Bell className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card) => (
                        <div key={card.name} className="bg-charcoal p-8 border-2 border-charcoal hover:border-white transition-all group overflow-hidden relative">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 -rotate-45 group-hover:bg-neon-green/10 transition-colors" />
                            <div className="relative space-y-6">
                                <div className="flex justify-between items-start">
                                    <card.icon className={cn("w-8 h-8", card.color)} />
                                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{card.name}</p>
                                    <p className="text-4xl font-black italic tracking-tighter mt-1">{isLoading ? "..." : card.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Deployment Activity */}
                    <div className="lg:col-span-2 bg-charcoal border-2 border-charcoal p-8 space-y-8">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <h2 className="text-2xl font-black uppercase italic">RECENT DEPLOYMENTS</h2>
                            <Link href="/admin/orders">
                                <Button variant="link" className="text-neon-green font-black uppercase text-[10px] tracking-widest">VIEW ALL</Button>
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-black/40 border-l-4 border-neon-green">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-charcoal flex items-center justify-center font-black text-xs">#{1024 + i}</div>
                                        <div>
                                            <p className="font-black uppercase text-sm tracking-tight">OPERATIVE_BETA_{i}</p>
                                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">SHIPPED 2HRS AGO</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-neon-green tabular-nums">$299.00</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Alerts */}
                    <div className="bg-black border-2 border-white/5 p-8 space-y-8">
                        <h2 className="text-2xl font-black uppercase italic">CRITICAL STOCK</h2>
                        <div className="space-y-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span>GEAR_X_{i}</span>
                                        <span className="text-electric-pink">LOW</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-charcoal">
                                        <div className="h-full bg-electric-pink w-1/4 group-hover:w-1/3 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/admin/products">
                            <Button className="w-full bg-white text-black font-black uppercase rounded-none h-14 mt-4 shadow-[4px_4px_0px_#FF006B]">
                                REPLENISH PROTOCOL
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
