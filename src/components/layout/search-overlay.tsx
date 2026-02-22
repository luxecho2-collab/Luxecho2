"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { Search, X, Loader2 } from "lucide-react"
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

    // Search results
    const { data: searchResults, isLoading: isSearchLoading } = api.product.list.useQuery(
        { search: debouncedQuery, take: 10 },
        { enabled: debouncedQuery.length > 0 }
    )

    // Trending products (fallback when no search)
    const { data: trendingProducts, isLoading: isTrendingLoading } = api.product.list.useQuery(
        { take: 10 },
        { enabled: isOpen && debouncedQuery.length === 0 }
    )

    const products = debouncedQuery.length > 0 ? searchResults?.items : trendingProducts?.items
    const isLoading = isSearchLoading || isTrendingLoading

    const handleSelect = (slug: string) => {
        onClose()
        router.push(`/product/${slug}`)
    }

    // Handle Escape key & Scroll Lock
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }

        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }

        window.addEventListener("keydown", handleEsc)
        return () => {
            window.removeEventListener("keydown", handleEsc)
            document.body.style.overflow = "unset"
        }
    }, [onClose, isOpen])

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
                                    placeholder="SEARCH"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="flex-1 h-full bg-transparent border-none rounded-none text-xl md:text-2xl font-bold uppercase tracking-widest placeholder:text-gray-200 outline-none ring-0 focus-visible:ring-0 p-0"
                                />
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
                            <div className="mb-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                    {debouncedQuery.length > 0 ? "SEARCH RESULTS" : "TRENDING PRODUCTS"}
                                </h2>
                            </div>

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
                                                    RS. {item.price.toLocaleString('en-IN')}.00
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">No results found for "{debouncedQuery}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
