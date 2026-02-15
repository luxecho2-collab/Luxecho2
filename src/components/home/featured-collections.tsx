"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const collections = [
    {
        title: "Cyber Streetwear",
        slug: "cyber-streetwear",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
        color: "bg-neon-green",
    },
    {
        title: "Neon Essentials",
        slug: "neon-essentials",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
        color: "bg-electric-pink",
    },
    {
        title: "Minimalist Basics",
        slug: "minimalist-basics",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1920&auto=format&fit=crop",
        color: "bg-cyber-blue",
    },
]

export function FeaturedCollections() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">
                            THE <span className="text-neon-green">LAB</span>
                        </h2>
                        <p className="text-muted-foreground uppercase tracking-widest font-bold">
                            Curated experiments in digital tailoring
                        </p>
                    </div>
                    <Link href="/collections">
                        <Button variant="link" className="text-neon-green uppercase font-black tracking-widest text-lg p-0">
                            View All Experiments +
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection, idx) => (
                        <motion.div
                            key={collection.slug}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative aspect-[3/4] overflow-hidden bg-charcoal border-2 border-border shadow-[12px_12px_0px_#1A1A1A] hover:shadow-[16px_16px_0px_#00FF41] transition-all duration-500"
                        >
                            <Image
                                src={collection.image}
                                alt={collection.title}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-80" />

                            <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className={cn("inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black mb-4 -skew-x-12", collection.color)}>
                                    GEAR / {idx + 1}
                                </span>
                                <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-6">
                                    {collection.title}
                                </h3>
                                <Link href={`/collections/${collection.slug}`}>
                                    <Button className="w-full bg-white text-black font-black uppercase tracking-widest rounded-none hover:bg-neon-green transition-colors">
                                        Explore
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
