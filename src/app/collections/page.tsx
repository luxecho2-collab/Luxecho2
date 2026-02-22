"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Sparkles, Zap, Shield, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

const collections = [
    {
        id: "neural-tech",
        title: "Essential Tech",
        subtitle: "PREMIUM EDITION",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200",
        color: "text-white",
        bg: "bg-white/5",
        icon: Zap,
        description: "High-performance tech accessories designed for the modern professional."
    },
    {
        id: "stealth-utility",
        title: "Utility Series",
        subtitle: "LIMITED RELEASE",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200",
        color: "text-gray-400",
        bg: "bg-gray-400/5",
        icon: Shield,
        description: "Tactical everyday carry enhancements designed for urban navigation."
    },
    {
        id: "brown-vibe",
        title: "Earth Tone",
        subtitle: "STREET SERIES",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
        color: "text-amber-700",
        bg: "bg-amber-900/20",
        icon: Flame,
        description: "Earthy, grounded tonal upgrades that dominate the visual landscape."
    },
    {
        id: "zenz-core",
        title: "Core Essentials",
        subtitle: "MINIMALIST EDITION",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200",
        color: "text-gray-300",
        bg: "bg-white/5",
        icon: Sparkles,
        description: "Balanced essentials that merge functional design with minimalist serenity."
    }
]

export default function CollectionsPage() {
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 lg:p-12 space-y-16">
            <header className="space-y-6 max-w-4xl pt-12">
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
                    <span className="w-12 h-[1px] bg-gray-500" />
                    Collection Archive
                </div>
                <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
                    CURATED <span className="text-gray-400">EDITIONS</span>
                </h1>
                <p className="text-sm md:text-xl font-bold uppercase tracking-widest text-muted-foreground max-w-2xl leading-relaxed italic">
                    Access specialized collections curated for the modern urban landscape.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {collections.map((col) => (
                    <Link key={col.id} href={`/products?category=${col.id}`} className="group relative overflow-hidden bg-white/5 aspect-[16/10] md:aspect-[16/9] border border-white/10 hover:border-white transition-all duration-700">
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Explore</span>
                                    <div className="w-12 h-[1px] bg-white group-hover:w-24 transition-all duration-500" />
                                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Subtle Glow Effect */}
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </Link>
                ))}
            </div>

            {/* Footer Polish */}
            <footer className="pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                <div className="flex items-center gap-8">
                    <span className="hover:text-white cursor-pointer italic">Quality Assured</span>
                    <span className="hover:text-white cursor-pointer italic">Worldwide Shipping</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white italic">Luxecho Studio</span>
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <span className="italic">Est. 2026</span>
                </div>
            </footer>
        </div>
    )
}
