"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    User,
    Settings,
    ShoppingBag,
    Heart,
    LogOut,
    ShieldCheck,
    Package,
    MapPin,
    ArrowRight,
    Star,
    LayoutGrid,
    Target
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/product/product-card"
import { motion } from "framer-motion"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const { data: featuredProducts } = api.product.getFeatured.useQuery()

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="container mx-auto px-4 py-24 text-center space-y-8">
                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-8">SIGN IN <span className="text-neon-green">REQUIRED</span></h1>
                <p className="max-w-md mx-auto text-muted-foreground uppercase font-bold text-sm tracking-widest leading-relaxed">
                    Access your personalized style portal and manage your collections.
                </p>
                <Link href="/api/auth/signin">
                    <Button className="bg-white text-black font-black uppercase tracking-widest rounded-none px-12 h-16 shadow-[8px_8px_0px_#00FF41] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        Initialize Session
                    </Button>
                </Link>
            </div>
        )
    }

    const { user } = session

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Header */}
            <div className="relative h-[40vh] bg-charcoal flex items-center overflow-hidden border-b-4 border-black">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070')] bg-cover bg-center" />
                <div className="container mx-auto px-4 relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <Avatar className="w-40 h-40 md:w-56 md:h-56 rounded-none border-8 border-black shadow-[12px_12px_0px_#00FF41]">
                            <AvatarImage src={user.image ?? ""} className="object-cover" />
                            <AvatarFallback className="bg-charcoal text-white font-black text-6xl">{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-4 -right-4 bg-neon-green text-black p-3 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000]">
                            Active
                        </div>
                    </motion.div>

                    <div className="text-center md:text-left space-y-4">
                        <span className="text-neon-green text-xs font-black uppercase tracking-[0.4em]">Style Portal / User.id_{user.id.slice(-4)}</span>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white whitespace-pre-line">
                            {user.name?.toUpperCase().split(' ').join('\n')}
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-4 py-2 border border-white/10 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-neon-green" /> Verified Member
                            </div>
                            <div className="px-4 py-2 border border-white/10 bg-black/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Target className="w-3 h-3 text-neon-green" /> Style Level 07
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-16">
                    {/* Navigation Sidebar */}
                    <aside className="space-y-12">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Command Center</h3>
                            <nav className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                {[
                                    { name: "DASHBOARD", icon: User, href: "/account", active: true },
                                    { name: "ORDER HISTORY", icon: Package, href: "/account/orders" },
                                    { name: "VAULT / WISHLIST", icon: Heart, href: "/account/wishlist" },
                                    { name: "GEO LOCATIONS", icon: MapPin, href: "/account/addresses" },
                                    { name: "SYSTEM CONFIG", icon: Settings, href: "/account/settings" },
                                ].map((item) => (
                                    <Link key={item.name} href={item.href} className="block group">
                                        <div className={cn(
                                            "flex items-center gap-4 px-6 h-16 border-2 transition-all group-hover:bg-white/5",
                                            item.active ? "bg-white text-black border-white" : "bg-black text-white border-charcoal"
                                        )}>
                                            <item.icon className={cn("w-5 h-5", item.active ? "text-black" : "text-neon-green")} />
                                            <span className="font-black text-[10px] tracking-widest">{item.name}</span>
                                        </div>
                                    </Link>
                                ))}
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-4 px-6 h-16 border-2 border-charcoal bg-black text-white hover:bg-neon-green hover:text-black hover:border-neon-green transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-black text-[10px] tracking-widest uppercase">Terminate Session</span>
                                </button>
                            </nav>
                        </section>

                        {/* Admin Link (Conditional) */}
                        {user.role === "ADMIN" && (
                            <section className="space-y-4 pt-12 border-t-2 border-charcoal">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green ml-1">Admin Privilege</h3>
                                <Link href="/admin">
                                    <Button className="w-full h-16 bg-neon-green text-black font-black uppercase tracking-widest rounded-none shadow-[4px_4px_0px_#fff]">
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            </section>
                        )}
                    </aside>

                    {/* Main Stats and Recommendations */}
                    <main className="xl:col-span-3 space-y-16">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: "TOTAL ORDERS", value: "00", icon: ShoppingBag, detail: "Across all seasons" },
                                { label: "WISHLIST ITEMS", value: "12", icon: Heart, detail: "Waiting in vault" },
                                { label: "STYLE POINTS", value: "480", icon: Star, detail: "Premium tier" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-8 border-4 border-charcoal bg-black group transition-all hover:border-white"
                                >
                                    <stat.icon className="w-10 h-10 text-neon-green mb-6" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</h4>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-5xl font-black tracking-tighter">{stat.value}</span>
                                        <span className="text-[10px] font-black uppercase text-neon-green">{stat.detail}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Handpicked Recommendations */}
                        <section className="space-y-12">
                            <div className="flex justify-between items-end border-b-4 border-white/5 pb-8">
                                <div className="space-y-2">
                                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight italic">
                                        HANDPICKED <span className="text-neon-green">FOR YOU</span>
                                    </h2>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        AI-CURATED PIECES BASED ON YOUR VISUAL SIGNATURE
                                    </p>
                                </div>
                                <Link href="/products" className="hidden md:flex items-center gap-2 text-neon-green text-[10px] font-black uppercase tracking-widest border-b border-neon-green pb-1">
                                    View full collection <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {featuredProducts?.slice(0, 3).map((product) => (
                                    <ProductCard key={product.id} product={product as any} />
                                ))}
                            </div>

                            <Link href="/products" className="md:hidden">
                                <Button variant="outline" className="w-full h-14 border-2 border-white rounded-none font-black uppercase tracking-widest">
                                    Browse All Gear
                                </Button>
                            </Link>
                        </section>

                        {/* Visual Banner */}
                        <div className="relative h-64 bg-neon-green p-12 overflow-hidden flex items-center justify-between group cursor-pointer shadow-[16px_16px_0px_#fff]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 -translate-y-12 translate-x-12 rotate-12 transition-transform group-hover:scale-110" />
                            <div className="relative z-10 space-y-2">
                                <h3 className="text-black text-4xl font-black uppercase italic leading-tight">
                                    UNLOCK PREMIUM<br />STYLE ACCESS
                                </h3>
                                <p className="text-black/60 font-black text-xs uppercase tracking-widest">
                                    Upgrade to Elite status for early drops.
                                </p>
                            </div>
                            <div className="relative z-10 w-16 h-16 bg-black flex items-center justify-center text-white">
                                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
