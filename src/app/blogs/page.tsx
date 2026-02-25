"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Clock,
    ArrowRight,
    Search,
    ChevronDown,
    Filter
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { motion } from "framer-motion"

export default function BlogListingPage() {
    const { data: posts, isLoading } = api.blog.list.useQuery({ take: 20 })

    return (
        <div className="min-h-screen bg-white">
            {/* Editorial Hero Header */}
            <header className="pt-32 pb-24 border-b border-gray-100">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <span className="w-12 h-[2px] bg-black" />
                            <span className="text-xs font-black uppercase tracking-[0.4em]">The Editorial Journal</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-black"
                        >
                            LUXECHO <span className="text-transparent font-outline-2 text-gray-200" style={{ WebkitTextStroke: '1px #e5e7eb' }}>STORIES</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl font-bold uppercase tracking-widest text-gray-400 max-w-2xl leading-relaxed"
                        >
                            Curating the intersection of high-fashion, minimalist design, and contemporary culture.
                        </motion.p>
                    </div>
                </div>
            </header>

            {/* Filter Bar */}
            <nav className="sticky top-20 z-40 bg-white border-b border-gray-100 py-6">
                <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex gap-8 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {['All Stories', 'Culture', 'Design', 'Collections', 'Behind the Scenes'].map((cat, i) => (
                            <button
                                key={cat}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all",
                                    i === 0 ? "text-black underline underline-offset-8" : "text-gray-300 hover:text-black"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <Input
                            placeholder="SEARCH JOURNAL..."
                            className="bg-gray-50 border-none rounded-none h-12 pl-12 text-[10px] font-black uppercase tracking-widest placeholder:text-gray-300 focus-visible:ring-black"
                        />
                    </div>
                </div>
            </nav>

            {/* Post Grid */}
            <section className="container mx-auto px-6 lg:px-12 py-24">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="space-y-6 animate-pulse">
                                <div className="aspect-[4/5] bg-gray-100" />
                                <div className="h-8 bg-gray-100 w-3/4" />
                                <div className="h-4 bg-gray-100 w-1/4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                        {posts?.items.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index % 3 * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-gray-100">
                                        {post.featuredImage ? (
                                            <img
                                                src={post.featuredImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-6xl font-black">STORY</div>
                                        )}
                                        <div className="absolute bottom-6 left-6 space-y-2">
                                            <div className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest w-fit">
                                                EDITORIAL
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            <span>{format(new Date(post.publishedAt || post.createdAt), "MMM dd, yyyy")}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime || 5} MIN</span>
                                        </div>
                                        <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight group-hover:translate-x-3 transition-transform duration-500">
                                            {post.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed font-medium">
                                            {post.excerpt || post.content.substring(0, 150) + "..."}
                                        </p>
                                        <div className="pt-4 overflow-hidden">
                                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all duration-500">
                                                Read Fully <ArrowRight className="w-3 h-3 group-hover:translate-x-4 transition-transform" />
                                                <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-black -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}

                {/* Simplified Pagination/Load More */}
                <div className="mt-32 text-center">
                    <Button variant="outline" className="rounded-none border-gray-100 h-16 px-16 group hover:border-black transition-all">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] mr-4 transition-all group-hover:mr-8">Load More Archives</span>
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            </section>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
