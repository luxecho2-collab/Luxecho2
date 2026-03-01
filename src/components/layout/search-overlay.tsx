"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { Search, X, Loader2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SearchOverlayProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const router = useRouter()

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    // Reset query when closed
    React.useEffect(() => {
        if (!isOpen) {
            setQuery("")
            setDebouncedQuery("")
        }
    }, [isOpen])

    const isQueryReady = debouncedQuery.trim().length >= 2

    // Ranked search results using the dedicated search endpoint
    const { data: searchResults, isLoading: isSearchLoading } = api.product.search.useQuery(
        { query: debouncedQuery, take: 10 },
        { enabled: isQueryReady }
    )

    // Trending products (shown when no query)
    const { data: trendingProducts, isLoading: isTrendingLoading } = api.product.list.useQuery(
        { take: 10, sort: "newest" },
        { enabled: isOpen && !isQueryReady }
    )

    const products = isQueryReady ? searchResults : trendingProducts?.items
    const isLoading = isQueryReady ? isSearchLoading : isTrendingLoading

    const handleSelect = (slug: string) => {
        onClose()
        router.push(`/product/${slug}`)
    }

    const handleViewAll = () => {
        onClose()
        router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    }

    // Handle Escape key, Enter key & Scroll Lock
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "Enter" && query.trim().length >= 2) handleViewAll()
        }

        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            document.body.style.overflow = "unset"
        }
    }, [onClose, isOpen, query])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white overflow-y-auto custom-scrollbar"
                >
                    <div className="min-h-screen flex flex-col">
                        {/* Top Search Bar */}
                        <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
                            <div className="container mx-auto px-6 h-20 md:h-24 flex items-center gap-4">
                                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                                <Input
                                    autoFocus
                                    placeholder="SEARCH PRODUCTS..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 h-full bg-transparent border-none rounded-none text-xl md:text-2xl font-bold uppercase tracking-widest placeholder:text-gray-200 outline-none ring-0 focus-visible:ring-0 p-0"
                                />
                                {query.length > 0 && (
                                    <button
                                        onClick={() => { setQuery(""); setDebouncedQuery("") }}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                    >
                                        <X className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                >
                                    <X className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="container mx-auto px-6 py-12 flex-grow">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                    {isQueryReady
                                        ? `SEARCH RESULTS ${searchResults ? `(${searchResults.length})` : ""}`
                                        : "TRENDING PRODUCTS"
                                    }
                                </h2>
                                {isQueryReady && (searchResults?.length ?? 0) > 0 && (
                                    <button
                                        onClick={handleViewAll}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:opacity-60 transition-opacity"
                                    >
                                        View All <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Hint when query too short */}
                            {query.trim().length === 1 && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 py-4">
                                    Type at least 2 characters...
                                </p>
                            )}

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Scanning Catalog...</p>
                                </div>
                            ) : (products && products.length > 0) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                                    {products.map((item: any, i: number) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => handleSelect(item.slug)}
                                            className="group cursor-pointer"
                                        >
                                            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden mb-4">
                                                {item.images[0] && (
                                                    <Image
                                                        src={item.images[0].url}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-900 group-hover:underline decoration-1 underline-offset-4 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase">
                                                    ₹{item.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : isQueryReady ? (
                                <div className="py-20 text-center">
                                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">No results found for "{debouncedQuery}"</p>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-3">Try different keywords or browse all products</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
