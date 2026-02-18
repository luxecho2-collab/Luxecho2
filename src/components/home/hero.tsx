"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

export function Hero() {
    return (
        <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-white">
            {/* Minimalist Luxecho Background Element */}
            <div className="absolute top-0 right-0 w-[45%] h-full bg-neutral-50 -skew-x-6 transform translate-x-1/4" />

            {/* Animated Logo Motif (Subtle Echo) */}
            <div className="absolute -bottom-20 -left-20 w-96 h-96 opacity-[0.03] pointer-events-none">
                <LuxechoLogo size={400} animate={true} />
            </div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <LuxechoLogo size={48} />
                            <div className="h-px w-12 bg-black/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/40">Spring Summer 2026</span>
                        </div>

                        <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.75] mb-12">
                            LUXURY <br />
                            <span className="text-black">EVOLVED</span>
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
                            <p className="text-lg md:text-xl text-neutral-500 uppercase tracking-[0.15em] leading-relaxed font-bold">
                                Where artisanal craftsmanship meets the pulse of modern minimalsm. <span className="text-black">Luxecho</span> is the silhouette of tomorrow.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/products" className="group">
                                    <Button size="lg" className="h-20 px-12 bg-black text-white font-black uppercase tracking-[0.2em] rounded-none text-[11px] md:text-sm hover:translate-x-2 hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group">
                                        Explore Catalog
                                        <ArrowRight className="ml-4 w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                        <div className="absolute inset-0 border-2 border-black translate-x-3 translate-y-3 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-12 right-12 flex flex-col items-end gap-2">
                <div className="w-24 h-[1px] bg-black" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Collective</span>
            </div>
        </section>
    )
}
