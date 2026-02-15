"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { Search, X, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
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

    const { data, isLoading } = api.product.list.useQuery(
        { search: debouncedQuery, take: 5 },
        { enabled: debouncedQuery.length > 2 }
    )

    const handleSelect = (slug: string) => {
        onClose()
        router.push(`/product/${slug}`)
    }

    // Handle Escape key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center pt-24 px-4"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white hover:text-neon-green transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </Button>

                    <div className="w-full max-w-3xl space-y-12">
                        <div className="relative group">
                            <Input
                                autoFocus
                                placeholder="SEARCH PRODUCTS..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-24 bg-transparent border-b-4 border-charcoal focus:border-neon-green rounded-none text-4xl md:text-6xl font-black uppercase italic tracking-tighter placeholder:text-charcoal transition-all text-white outline-none ring-0 focus-visible:ring-0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isLoading ? (
                                    <Loader2 className="w-10 h-10 text-neon-green animate-spin" />
                                ) : (
                                    <Search className="w-10 h-10 text-charcoal group-focus-within:text-neon-green transition-colors" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {debouncedQuery.length > 2 && !isLoading && data?.items.length === 0 && (
                                <p className="text-muted-foreground font-bold uppercase text-center py-12">
                                    No results found
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data?.items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelect(item.slug)}
                                        className="flex gap-4 p-4 bg-charcoal border-2 border-transparent hover:border-neon-green transition-all cursor-pointer group"
                                    >
                                        <div className="relative w-20 aspect-square bg-deep-black overflow-hidden flex-shrink-0">
                                            {item.images[0] && (
                                                <Image
                                                    src={item.images[0].url}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest leading-none">
                                                {item.category?.name}
                                            </p>
                                            <p className="text-lg font-black uppercase italic tracking-tight group-hover:text-neon-green transition-colors">
                                                {item.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-white font-black">
                                                <span>${item.price.toString()}</span>
                                                <ArrowRight className="w-4 h-4 text-neon-green opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-12 text-center">
                            <Link href={`/products?search=${query}`} onClick={onClose}>
                                <Button className="bg-neon-green text-black font-black uppercase px-12 h-16 rounded-none text-xl shadow-[8px_8px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                    VIEW ALL RESULTS
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-auto pb-12 flex gap-8 items-center justify-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em] text-white">
                        <span>QUALITY</span>
                        <div className="w-2 h-2 rounded-full bg-neon-green" />
                        <span>ESSENTIAL</span>
                        <div className="w-2 h-2 rounded-full bg-neon-green" />
                        <span>PREMIUM</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
