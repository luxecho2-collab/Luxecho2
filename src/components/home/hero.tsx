"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-deep-black">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-neon-green/5 -skew-x-12 transform translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-electric-pink/5 skew-x-12 transform -translate-x-1/4" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <span className="inline-block px-4 py-1 bg-neon-green text-black font-bold uppercase tracking-[0.3em] text-xs mb-6 -skew-x-12">
                            New Collection 2026
                        </span>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 italic">
                            UNLEASH THE <br />
                            <span className="text-neon-green glow-text">NEON</span> <span className="stroke-text">STORM</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground uppercase tracking-widest mb-12 max-w-2xl font-semibold">
                            Neo-Brutalist fashion for the digital edge. High-performance streetwear designed in the future.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/products">
                                <Button size="lg" className="h-16 px-10 bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-lg hover:bg-neon-green/90 hover:scale-105 transition-all shadow-[8px_8px_0px_#000,8px_8px_0px_2px_#00FF41]">
                                    Shop Collection
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </Link>
                            <Link href="/collections/cyber-streetwear">
                                <Button size="lg" variant="outline" className="h-16 px-10 border-white text-white font-black uppercase tracking-widest rounded-none text-lg hover:bg-white hover:text-black transition-all">
                                    Lookbook
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Elements / Accents */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-1/4 right-10 hidden lg:block"
            >
                <div className="w-64 h-64 border-2 border-neon-green/20 -rotate-12 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-electric-pink/20 rotate-45" />
                </div>
            </motion.div>

            <style jsx>{`
        .stroke-text {
          -webkit-text-stroke: 2px white;
          color: transparent;
        }
      `}</style>
        </section>
    )
}
