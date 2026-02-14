"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
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
    MapPin
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase italic">Scanning Neural Signature...</div>
    }

    if (!session) {
        return (
            <div className="container mx-auto px-4 py-24 text-center space-y-8">
                <h1 className="text-4xl font-black uppercase italic mb-8">ACCESS <span className="text-electric-pink">DENIED</span></h1>
                <p className="max-w-md mx-auto text-muted-foreground uppercase font-bold text-sm tracking-widest">
                    You must be authenticated to access this sector.
                </p>
                <Link href="/api/auth/signin">
                    <Button className="bg-neon-green text-black font-black uppercase tracking-widest rounded-none px-12 h-16 shadow-[8px_8px_0px_#fff]">
                        Log In to Network
                    </Button>
                </Link>
            </div>
        )
    }

    const { user } = session

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Profile Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-8">
                    <div className="bg-charcoal p-8 border-4 border-black relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/5 -rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-150" />

                        <div className="relative flex flex-col items-center text-center space-y-4">
                            <Avatar className="w-24 h-24 rounded-none border-4 border-neon-green">
                                <AvatarImage src={user.image ?? ""} />
                                <AvatarFallback className="bg-black text-white font-black text-2xl">{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">{user.name}</h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { name: "DASHBOARD", icon: User, href: "/account", active: true },
                            { name: "ORDERS", icon: Package, href: "/account/orders" },
                            { name: "WISHLIST", icon: Heart, href: "/account/wishlist" },
                            { name: "ADDRESSES", icon: MapPin, href: "/account/addresses" },
                            { name: "SETTINGS", icon: Settings, href: "/account/settings" },
                        ].map((item) => (
                            <Link key={item.name} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-6 border-2",
                                        item.active ? "border-neon-green bg-charcoal text-white" : "border-transparent text-muted-foreground hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", item.active ? "text-neon-green" : "")} />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-6 text-electric-pink hover:bg-electric-pink hover:text-white"
                        >
                            <LogOut className="w-5 h-5" />
                            DISCONNECT
                        </Button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-grow space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-black pb-8">
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                                SECTOR <span className="text-neon-green">/ 07</span>
                            </h1>
                            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
                                WELCOME BACK, OPERATIVE {user.name?.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-charcoal p-8 border-2 border-charcoal space-y-6 hover:border-white transition-colors group">
                            <div className="flex items-center justify-between">
                                <Package className="w-10 h-10 text-neon-green" />
                                <span className="text-4xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">00</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic">RECENT ORDERS</h3>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">NO DEPLOYMENTS LOGGED</p>
                            </div>
                            <Link href="/products">
                                <Button className="w-full bg-white text-black font-black uppercase rounded-none h-12 shadow-[4px_4px_0px_#00FF41]">
                                    BROWSING PROTOCOL
                                </Button>
                            </Link>
                        </div>

                        <div className="bg-charcoal p-8 border-2 border-charcoal space-y-6 hover:border-white transition-colors group">
                            <div className="flex items-center justify-between">
                                <ShieldCheck className="w-10 h-10 text-neon-green" />
                                <span className="text-4xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">LVL 1</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase italic">ACCOUNT STATUS</h3>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">VERIFIED CYBER-CITIZEN</p>
                            </div>
                            <Button variant="outline" className="w-full border-2 border-white text-white font-black uppercase rounded-none h-12">
                                VIEW PERMISSIONS
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
