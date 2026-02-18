"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const collections = [
    {
        title: "Street Culture",
        slug: "street-culture",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
        badge: "01",
    },
    {
        title: "Modern Minimal",
        slug: "modern-minimal",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        badge: "02",
    },
    {
        title: "Urban Essentials",
        slug: "urban-essentials",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1920&auto=format&fit=crop",
        badge: "03",
    },
]

export function FeaturedCollections() {
    return (
        <section className="py-32 bg-white">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-[2px] w-12 bg-black" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Curated drops</span>
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                            THE <span className="text-gray-200">VAULT</span>
                        </h2>
                    </div>
                    <Link href="/collections" className="group">
                        <Button variant="link" className="text-black uppercase font-black tracking-widest text-sm p-0 flex items-center gap-3 hover:no-underline">
                            <span className="group-hover:text-black transition-colors">See all Catalog</span>
                            <div className="w-8 h-8 bg-black flex items-center justify-center rotate-45 group-hover:bg-black transition-all">
                                <span className="text-white text-[10px] -rotate-45">+</span>
                            </div>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {collections.map((collection, idx) => (
                        <motion.div
                            key={collection.slug}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            viewport={{ once: true }}
                            className="group relative aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100"
                        >
                            <Image
                                src={collection.image}
                                alt={collection.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Offset Border Effect */}
                            <div className="absolute inset-4 border border-white/20 z-10 pointer-events-none group-hover:inset-6 transition-all duration-500" />

                            <div className="absolute bottom-0 left-0 p-8 w-full z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-[40px] font-black text-white/20 leading-none">{collection.badge}</span>
                                    <div className="h-[1px] flex-grow bg-white/20" />
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-8">
                                    {collection.title}
                                </h3>
                                <Link href={`/collections/${collection.slug}`}>
                                    <Button className="w-full bg-white text-black font-black uppercase tracking-[0.2em] rounded-none text-[10px] h-14 hover:bg-black hover:text-white transition-colors">
                                        Explre Collection
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
