"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Users,
    ArrowLeft,
    Search,
    Shield,
    MoreHorizontal,
    Mail,
    Calendar,
    ShoppingBag
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function AdminCustomersPage() {
    const { data: users, isLoading } = api.admin.getUsers.useQuery({})

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* Admin Sidebar (Same as other admin pages) */}
            <aside className="w-64 border-r-4 border-black bg-charcoal hidden lg:flex flex-col">
                <div className="p-8 border-b-4 border-black">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        ADM <span className="text-neon-green">/ HUB</span>
                    </span>
                </div>
                <nav className="p-4 flex-grow space-y-2">
                    {[
                        { name: "DASHBOARD", href: "/admin" },
                        { name: "PRODUCTS", href: "/admin/products" },
                        { name: "ORDERS", href: "/admin/orders" },
                        { name: "CUSTOMERS", href: "/admin/customers", active: true },
                    ].map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2",
                                    item.active ? "border-neon-green bg-black text-white" : "border-transparent text-muted-foreground hover:text-white"
                                )}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
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
                            OPERATIVE <span className="text-neon-green">/ LOGS</span>
                        </h1>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="FILTER BY OPERATIVE DESIGNATION OR EMAIL..."
                        className="bg-charcoal border-2 border-black focus:border-neon-green rounded-none h-14 pl-12 font-bold uppercase italic tracking-widest"
                    />
                </div>

                <div className="border-4 border-black bg-charcoal overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b-2 border-black">
                                <th className="p-6">OPERATIVE</th>
                                <th className="p-6">ACCESS STATUS</th>
                                <th className="p-6">JOIN DATE</th>
                                <th className="p-6">DEPLOYMENTS</th>
                                <th className="p-6">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-24 text-center font-black uppercase italic animate-pulse">Syncing Operative Database...</td></tr>
                            ) : users?.map((user: any) => (
                                <tr key={user.id} className="border-b-2 border-black/20 hover:bg-black/20 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase italic tracking-tight group-hover:text-neon-green transition-colors">{user.name || "UNIDENTIFIED"}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                    <Mail className="w-2 h-2" /> {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className={cn(
                                            "px-3 py-1 text-[8px] font-black uppercase border w-fit",
                                            user.role === "ADMIN" ? "border-electric-pink text-electric-pink bg-electric-pink/10" : "border-white/20 text-white"
                                        )}>
                                            {user.role} ACCESS
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(user.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 font-black tabular-nums">
                                            <ShoppingBag className="w-4 h-4 text-cyber-blue" />
                                            {user.orders.length}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="border-2 border-white/20 rounded-none h-10 w-10 p-0 hover:border-white">
                                                <Shield className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" className="rounded-none h-10 w-10 p-0 hover:text-neon-green">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Button>
                                        </div>
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
