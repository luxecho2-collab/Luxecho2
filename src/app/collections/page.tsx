"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Sparkles, Zap, Shield, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

const collections = [
    {
        id: "neural-tech",
        title: "Neural Tech",
        subtitle: "GEN 4 GEAR",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200",
        color: "text-neon-green",
        bg: "bg-neon-green/5",
        icon: Zap,
        description: "High-frequency cybernetic interfaces and processing units for the modern operative."
    },
    {
        id: "stealth-utility",
        title: "Stealth Utility",
        subtitle: "VOID SERIES",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200",
        color: "text-cyber-blue",
        bg: "bg-cyber-blue/5",
        icon: Shield,
        description: "Low-signature tactical enhancements designed for deep-grid infiltration."
    },
    {
        id: "neon-vibe",
        title: "Neon Vibe",
        subtitle: "STREET RADIANCE",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
        color: "text-electric-pink",
        bg: "bg-electric-pink/5",
        icon: Flame,
        description: "Aggressive aesthetic upgrades that dominate the visual spectrum of any sector."
    },
    {
        id: "zenz-core",
        title: "Zenz Core",
        subtitle: "MINIMALIST PROTOCOL",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200",
        color: "text-white",
        bg: "bg-white/5",
        icon: Sparkles,
        description: "Balanced hardware that merges raw power with tactical serenity."
    }
]

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 space-y-16">
            <header className="space-y-6 max-w-4xl pt-12">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-neon-green">
                    <span className="w-12 h-[2px] bg-neon-green" />
                    Archive Directory
                </div>
                <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
                    GEAR <span className="text-neon-green">STREAMS</span>
                </h1>
                <p className="text-sm md:text-xl font-bold uppercase tracking-widest text-muted-foreground max-w-2xl leading-relaxed italic">
                    Access specialized tactical collections curated for maximum neural efficiency.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {collections.map((col) => (
                    <Link key={col.id} href={`/products?category=${col.id}`} className="group relative overflow-hidden bg-charcoal aspect-[16/10] md:aspect-[16/9] border-2 border-charcoal hover:border-neon-green transition-all duration-700">
                        {/* Background Image with Zoom effect */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={col.image}
                                alt={col.title}
                                fill
                                className="object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
                            />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", col.color)}>
                                        {col.subtitle}
                                    </p>
                                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter group-hover:translate-x-4 transition-transform duration-700">
                                        {col.title}
                                    </h2>
                                </div>
                                <div className={cn("w-12 h-12 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-all duration-500", col.bg, col.color)}>
                                    <col.icon className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-xs font-bold uppercase tracking-widest text-white/40 max-w-md group-hover:text-white transition-colors duration-500">
                                    {col.description}
                                </p>
                                <div className="flex items-center gap-4 group-hover:gap-6 transition-all duration-500">
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Sync Stream</span>
                                    <div className="w-12 h-[2px] bg-white group-hover:w-24 group-hover:bg-neon-green transition-all duration-500" />
                                    <ArrowUpRight className="w-5 h-5 group-hover:text-neon-green group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Scanner Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-24 -translate-y-[200%] group-hover:translate-y-[400%] transition-transform duration-[2000ms] ease-linear pointer-events-none" />
                    </Link>
                ))}
            </div>

            {/* Footer Polish */}
            <footer className="pt-24 border-t-2 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                <div className="flex items-center gap-8">
                    <span className="hover:text-neon-green cursor-pointer">Security Protocol 4.2</span>
                    <span className="hover:text-neon-green cursor-pointer">Inventory Sync Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white">Neural Hub</span>
                    <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
                    <span>Signal Strength: 100%</span>
                </div>
            </footer>
        </div>
    )
}
