"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Clock,
    Hash,
    Share2,
    MessageSquare,
    ChevronRight,
    ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { motion } from "framer-motion"

export default function BlogPostDetailPage() {
    const params = useParams()
    const slug = params.slug as string
    const { data: post, isLoading } = api.blog.getBySlug.useQuery({ slug })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white pt-40 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing Archives...</p>
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white pt-40 flex flex-col items-center px-6">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 italic">Story <span className="text-gray-200">Not Found</span></h1>
                <Link href="/blog">
                    <Button className="rounded-none bg-black text-white h-14 px-12 text-[10px] font-black uppercase tracking-widest">
                        Return to Journal
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Immersive Scroll Indicator could go here */}

            {/* Article Top Navigation */}
            <nav className="fixed top-20 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4">
                <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Journal
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-20 truncate max-w-[200px]">{post.title}</span>
                        <div className="flex gap-4">
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-black hover:text-white rounded-none">
                                <Share2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <article className="pt-40 max-w-4xl mx-auto px-6 lg:px-12 space-y-24 pb-40">
                {/* Editorial Header */}
                <header className="space-y-12">
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-black text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] w-fit"
                        >
                            Editorial Publication
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-black"
                        >
                            {post.title}
                        </motion.h1>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
                        <div className="flex gap-12">
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Published On</p>
                                <p className="text-[11px] font-black uppercase tracking-widest">
                                    {format(new Date(post.publishedAt || post.createdAt), "MMMM dd, yyyy")}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Reading Time</p>
                                <p className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> {post.readingTime || 5} MIN READ
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Article Written by</p>
                            <p className="text-[11px] font-black uppercase tracking-widest italic">{post.author}</p>
                        </div>
                    </div>
                </header>

                {/* Cinematic Featured Image */}
                {post.featuredImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative aspect-[16/9] md:aspect-[21/9] bg-gray-50 overflow-hidden"
                    >
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
                        />
                    </motion.div>
                )}

                {/* Primary Content Body */}
                <section className="space-y-16">
                    <div
                        className="prose prose-zinc lg:prose-2xl prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-gray-700 prose-p:leading-relaxed prose-p:font-medium prose-p:text-lg lg:prose-p:text-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </section>

                <footer className="border-t border-gray-100 pt-24 mt-40">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="space-y-6 text-center md:text-left">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Share this story</h3>
                            <div className="flex justify-center md:justify-start gap-4">
                                {['Twitter', 'Pinterest', 'Email'].map(social => (
                                    <Button key={social} variant="outline" className="rounded-none border-gray-100 text-[9px] font-black uppercase tracking-widest h-12 px-6 hover:bg-black hover:text-white transition-all">
                                        {social}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-12 text-center space-y-6 max-w-sm">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">Join the Collective</p>
                            <p className="text-xs font-bold uppercase tracking-widest italic leading-relaxed">
                                Curated aesthetic insights delivered directly to your tactical archives.
                            </p>
                            <Button className="w-full rounded-none bg-black text-white h-14 text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                                Subscribe to Luxecho
                            </Button>
                        </div>
                    </div>
                </footer>

                {/* Exploration Section */}
                <section className="pt-24 space-y-16">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter">Explore More</h2>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 mt-2">Extended Editorial Journal</p>
                        </div>
                        <Link href="/blog">
                            <Button variant="link" className="text-black font-black uppercase text-[10px] tracking-widest p-0 group">
                                All Archives <ArrowRight className="w-3.5 h-3.5 inline ml-2 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </article>
        </div>
    )
}
