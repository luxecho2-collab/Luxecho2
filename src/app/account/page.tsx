"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { api } from "@/trpc/react"
import {
    ShoppingBag,
    MapPin,
    Wallet,
    User,
    LogOut,
    ChevronRight,
    Heart,
    RefreshCw,
    Gift,
    Star,
    Store,
    Settings,
    HelpCircle,
    LayoutGrid,
    Users,
    ShieldCheck,
    Zap,
    Lock
} from "lucide-react"
import Link from "next/link"
import { AuthPortal } from "@/components/auth/auth-portal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = React.useState("overview")

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    const { user } = session

    const sidebarItems = [
        { id: "overview", label: "Dashboard", icon: LayoutGrid },
        { id: "profile", label: "Identity", icon: User },
        { id: "orders", label: "Acquisitions", icon: ShoppingBag },
        { id: "wishlist", label: "Vault", icon: Heart },
        { id: "settings", label: "Security", icon: Lock },
        ...(user.role === "ADMIN" ? [{ id: "admin", label: "Command Center", icon: ShieldCheck, href: "/admin" }] : []),
    ]

    const actionCards = [
        { title: "Acquisitions", desc: "Track and manage your recent drops", icon: ShoppingBag },
        { title: "The Vault", desc: "Your curated high-end selection", icon: Heart },
        { title: "Identity", desc: "Manage your technical profile", icon: User },
        { title: "Security", desc: "System access and password protocols", icon: Lock },
        ...(user.role === "ADMIN" ? [{ title: "Command Center", desc: "Privileged system access", icon: ShieldCheck, href: "/admin" }] : []),
    ]

    return (
        <div className="min-h-screen bg-white selection:bg-black selection:text-white">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
                    {/* LEFT COLUMN: TECHNICAL NAVIGATION */}
                    <aside className="lg:col-span-3 space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-black" />
                                <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">Navigation</h3>
                            </div>
                            <nav className="border border-gray-100 divide-y divide-gray-50 bg-white shadow-sm">
                                {sidebarItems.map((item) => {
                                    const IsActive = activeTab === item.id
                                    const Component = item.href ? Link : 'button'

                                    return (
                                        <Component
                                            key={item.id}
                                            {...(item.href ? { href: item.href } : { onClick: () => setActiveTab(item.id) })}
                                            className={cn(
                                                "w-full flex items-center justify-between px-8 py-6 text-left transition-all group",
                                                IsActive
                                                    ? "bg-black text-white"
                                                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <item.icon className={cn("w-4 h-4", IsActive ? "text-acid-green" : "text-gray-300 group-hover:text-black")} />
                                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase">{item.label}</span>
                                            </div>
                                            <ChevronRight className={cn(
                                                "w-4 h-4 transition-transform",
                                                IsActive ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-40"
                                            )} />
                                        </Component>
                                    )
                                })}
                            </nav>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-between px-8 py-6 border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-[11px] tracking-[0.2em] uppercase group"
                        >
                            <div className="flex items-center gap-5">
                                <LogOut className="w-4 h-4" />
                                <span>Terminate Access</span>
                            </div>
                        </button>
                    </aside>

                    {/* RIGHT COLUMN: INTERACTIVE CORE */}
                    <main className="lg:col-span-9 space-y-12">
                        {/* THE ELITE BANNER */}
                        <div className="relative bg-black text-white p-12 md:p-16 overflow-hidden min-h-[350px] flex flex-col justify-center border-b-8 border-acid-green shadow-[24px_24px_0px_rgba(0,0,0,0.03)]">
                            {/* Technical Backdrop */}
                            <div className="absolute inset-0 z-0 opacity-60">
                                <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(circle_at_100%_0%,rgba(212,255,0,0.15),transparent_60%)]" />
                                <div className="absolute bottom-0 left-0 w-[40%] h-full bg-[radial-gradient(circle_at_0%_100%,rgba(6,182,212,0.1),transparent_60%)]" />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />

                                {/* Moving Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
                            </div>

                            <div className="relative z-10 space-y-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-acid-green text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
                                        <Zap className="w-4 h-4 fill-current" />
                                        System_Online // Access_Level: Elite
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">
                                        ACCESS <span className="text-acid-green">GRANTED,</span><br />
                                        {user.name?.split(' ')[0] || "USER_01"}
                                    </h2>
                                </div>

                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group cursor-default">
                                        <ShieldCheck className="w-5 h-5 text-acid-green/40 group-hover:text-acid-green transition-colors" />
                                        Verified Signature
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group cursor-default">
                                        <Users className="w-5 h-5 text-acid-green/40 group-hover:text-acid-green transition-colors" />
                                        Core Membership
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] group cursor-default">
                                        <Wallet className="w-5 h-5 text-acid-green/40 group-hover:text-acid-green transition-colors" />
                                        Style Credits: Active
                                    </div>
                                </div>

                                <div className="pt-8 space-y-4 max-w-xl">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">
                                            Acquisition Progress to <span className="text-white">Elite Tier 2</span>
                                        </p>
                                        <span className="text-[9px] font-black text-acid-green">32.8%</span>
                                    </div>
                                    <div className="relative h-1.5 w-full bg-white/10 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "32.8%" }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            className="absolute inset-y-0 left-0 bg-acid-green"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Technical Logo */}
                            <div className="absolute top-12 right-12 z-10 flex flex-col items-end gap-1">
                                <span className="text-3xl font-black italic tracking-tighter text-white">FS<span className="text-acid-green">X</span></span>
                                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.4em]">Protocol_v2.0</span>
                            </div>
                        </div>

                        {/* ACTION GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {actionCards.map((card, i) => {
                                const CardWrapper = card.href ? Link : motion.div
                                return (
                                    <CardWrapper
                                        key={i}
                                        {...(card.href ? { href: card.href } : {})}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className="p-12 bg-white border border-gray-100 flex flex-col items-center text-center space-y-6 group cursor-pointer hover:border-black hover:shadow-[16px_16px_0px_rgba(0,0,0,0.05)] transition-all duration-500"
                                    >
                                        <div className="w-20 h-20 bg-gray-50 flex items-center justify-center transition-all duration-700 group-hover:bg-black group-hover:text-acid-green group-hover:rotate-12">
                                            <card.icon className="w-10 h-10" strokeWidth={1} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-black uppercase tracking-[0.3em]">{card.title}</h3>
                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-[200px]">{card.desc}</p>
                                        </div>
                                    </CardWrapper>
                                )
                            })}
                        </div>

                        {/* DATA SUMMARY / STATUS */}
                        <div className="p-12 bg-gray-50 border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="space-y-1 text-center md:text-left">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Identity_Reference</p>
                                    <p className="text-sm font-bold tracking-tight">{user.email}</p>
                                </div>
                                <div className="h-px w-24 bg-gray-200 hidden md:block" />
                                <div className="space-y-1 text-center md:text-right">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Session_Integrity</p>
                                    <p className="text-sm font-bold tracking-tight text-acid-green">Verified_Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
