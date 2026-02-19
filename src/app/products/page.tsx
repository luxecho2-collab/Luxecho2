"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/trpc/react"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"
import { ProductCard } from "@/components/product/product-card"
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton"
import { Button } from "@/components/ui/button"
import {
    X,
    SlidersHorizontal,
    ChevronDown,
    FilterX,
    ArrowRight,
    Circle,
    Check
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get("search") || ""

    const [search, setSearch] = React.useState(initialSearch)
    const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined)
    const [minPrice, setMinPrice] = React.useState<number | undefined>(undefined)
    const [maxPrice, setMaxPrice] = React.useState<number | undefined>(undefined)
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string[]>>({})
    const [sort, setSort] = React.useState<"newest" | "price_asc" | "price_desc">("newest")
    const [isFilterOpen, setIsFilterOpen] = React.useState(false)

    // Sync search state with URL param updates
    React.useEffect(() => {
        const querySearch = searchParams.get("search")
        if (querySearch !== null && querySearch !== search) {
            setSearch(querySearch)
        }
    }, [searchParams])

    // Fetch data
    const { data: categories } = api.product.getCategories.useQuery()
    const { data: dynamicFilters } = api.product.getFilters.useQuery()

    const { data, isLoading } = api.product.list.useQuery({
        categoryId,
        minPrice,
        maxPrice,
        search,
        options: selectedOptions,
        sort,
        take: 40,
    })

    const toggleOption = (name: string, value: string) => {
        setSelectedOptions(prev => {
            const current = (prev as Record<string, string[]>)[name] || []
            const next = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value]
            return { ...prev, [name]: next }
        })
    }

    const resetFilters = () => {
        setSearch("")
        setCategoryId(undefined)
        setMinPrice(undefined)
        setMaxPrice(undefined)
        setSelectedOptions({})
        setSort("newest")
    }

    const sortLabels = {
        newest: "NEWEST",
        price_asc: "PRICE: LOW TO HIGH",
        price_desc: "PRICE: HIGH TO LOW",
    }

    // Reference-based Mock Sections (for UI completeness where data might be sparse)
    const referenceSections = [
        { id: "pattern", name: "Pattern" },
        { id: "fit", name: "Fit" },
        { id: "material", name: "Material" },
        { id: "collar", name: "Collar" },
        { id: "sleeves", name: "Sleeves" },
    ]

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col selection:bg-black selection:text-white">
            {/* Sticky Header Bar - Responsive Height & Padding */}
            <header className="sticky top-14 md:top-20 z-30 bg-white border-b border-gray-100 h-14 md:h-16 shrink-0">
                <div className="h-full px-4 md:px-12 flex items-center justify-between gap-4">
                    {/* Filter Trigger - Fluid Font */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 group shrink-0"
                    >
                        <div className="relative">
                            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                            {isFilterOpen ? "Hide" : "Filter"}
                        </span>
                    </button>

                    {/* Horizontal Category Track - Fully Responsive & Touch Friendly */}
                    <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide flex-grow justify-start md:justify-center py-2 px-2">
                        <button
                            onClick={() => {
                                setCategoryId(undefined)
                                setSearch("")
                            }}
                            className={cn(
                                "text-[9px] md:text-[11px] font-black uppercase tracking-widest px-4 md:px-7 py-2 md:py-2.5 transition-all border shrink-0",
                                categoryId === undefined && !search ? "bg-black text-white border-black" : "bg-transparent text-neutral-600 border-gray-100 hover:border-black hover:text-black"
                            )}
                        >
                            All
                        </button>
                        {categories?.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setCategoryId(cat.id)
                                    setSearch("")
                                }}
                                className={cn(
                                    "text-[9px] md:text-[11px] font-black uppercase tracking-widest px-4 md:px-7 py-2 md:py-2.5 transition-all border shrink-0",
                                    categoryId === cat.id ? "bg-black text-white border-black" : "bg-transparent text-neutral-600 border-gray-100 hover:border-black hover:text-black"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-4 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-[10px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 group">
                                    <span className="hidden sm:inline">{sortLabels[sort]}</span>
                                    <span className="sm:hidden">Sort</span>
                                    <ChevronDown className="w-3.5 md:w-4 h-3.5 md:h-4 group-hover:translate-y-0.5 transition-transform" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-gray-100 rounded-none p-0 shadow-2xl min-w-[180px] md:min-w-[240px] z-50">
                                {Object.entries(sortLabels).map(([key, label]) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => setSort(key as any)}
                                        className={cn(
                                            "font-black uppercase text-[9px] md:text-[11px] tracking-widest p-4 cursor-pointer rounded-none focus:bg-gray-50",
                                            sort === key ? "text-black bg-gray-50 font-black" : "text-neutral-500"
                                        )}
                                    >
                                        {label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex relative">
                {/* Responsive Sidebar Overlay for Mobile */}
                <AnimatePresence>
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* UNIQUE: Integrated Sidebar (Responsive Behavior) */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: isFilterOpen ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? "100%" : 320) : 0,
                        opacity: isFilterOpen ? 1 : 0,
                        x: isFilterOpen ? 0 : -320
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 250 }}
                    className={cn(
                        "h-[calc(100vh-112px)] md:h-[calc(100vh-144px)] sticky top-28 md:top-36 overflow-hidden border-r border-gray-100 bg-white z-50 lg:z-30",
                        "fixed lg:sticky lg:left-0",
                        isFilterOpen ? "w-[85vw] max-w-[340px] lg:w-[320px]" : "w-0"
                    )}
                >
                    <div className="w-full lg:w-[320px] h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
                            <div className="flex items-center justify-between mb-10 lg:hidden">
                                <h2 className="text-[14px] font-black uppercase tracking-[0.4em]">Filters</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-gray-50 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <Accordion type="multiple" defaultValue={["category"]} className="w-full">
                                {/* Category Section */}
                                <AccordionItem value="category" className="border-b border-gray-100">
                                    <AccordionTrigger className="uppercase py-5 md:py-7 hover:no-underline font-black text-[11px] md:text-[13px] tracking-[0.2em] text-left shrink-0">
                                        Category
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-8">
                                        <div className="space-y-5">
                                            {categories?.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center gap-4 cursor-pointer group"
                                                    onClick={() => setCategoryId(categoryId === cat.id ? undefined : cat.id)}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 border transition-all flex items-center justify-center shrink-0",
                                                        categoryId === cat.id ? "bg-black border-black scale-110" : "border-gray-200 group-hover:border-black"
                                                    )}>
                                                        {categoryId === cat.id && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-colors",
                                                        categoryId === cat.id ? "text-black" : "text-neutral-600 group-hover:text-black"
                                                    )}>
                                                        {cat.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Dynamic Attributes Mapping */}
                                {dynamicFilters && Object.entries(dynamicFilters).map(([name, values]) => (
                                    <AccordionItem key={name} value={name.toLowerCase()} className="border-b border-gray-100">
                                        <AccordionTrigger className="uppercase py-5 md:py-7 hover:no-underline font-black text-[11px] md:text-[13px] tracking-[0.2em] text-left shrink-0">
                                            {name}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-8">
                                            <div className="space-y-5">
                                                {values.map((val) => (
                                                    <div
                                                        key={val}
                                                        className="flex items-center gap-4 cursor-pointer group"
                                                        onClick={() => toggleOption(name, val)}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 border transition-all flex items-center justify-center shrink-0",
                                                            selectedOptions[name]?.includes(val) ? "bg-black border-black scale-110" : "border-gray-200 group-hover:border-black"
                                                        )}>
                                                            {selectedOptions[name]?.includes(val) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                                                        </div>
                                                        <span className={cn(
                                                            "text-[11px] md:text-[13px] font-bold uppercase tracking-widest transition-colors",
                                                            selectedOptions[name]?.includes(val) ? "text-black" : "text-neutral-600 group-hover:text-black"
                                                        )}>
                                                            {val}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}

                                {/* Price Section - Responsive Inputs */}
                                <AccordionItem value="price" className="border-b border-gray-100">
                                    <AccordionTrigger className="uppercase py-5 md:py-7 hover:no-underline font-black text-[11px] md:text-[13px] tracking-[0.2em] text-left shrink-0">
                                        Pricing
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-10">
                                        <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2">
                                            <div className="space-y-3">
                                                <p className="text-[9px] md:text-[10px] font-black uppercase text-neutral-400 tracking-tighter">Min Value</p>
                                                <div className="flex items-center gap-1 border-b border-gray-200 pb-2 focus-within:border-black transition-colors">
                                                    <span className="text-[12px] font-black text-neutral-300">₹</span>
                                                    <input
                                                        type="number"
                                                        value={minPrice ?? ""}
                                                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                                                        className="w-full bg-transparent text-[13px] md:text-[15px] font-black outline-none placeholder:text-neutral-200"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[9px] md:text-[10px] font-black uppercase text-neutral-400 tracking-tighter">Max Value</p>
                                                <div className="flex items-center gap-1 border-b border-gray-200 pb-2 focus-within:border-black transition-colors">
                                                    <span className="text-[12px] font-black text-neutral-300">₹</span>
                                                    <input
                                                        type="number"
                                                        value={maxPrice ?? ""}
                                                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                                                        className="w-full bg-transparent text-[13px] md:text-[15px] font-black outline-none placeholder:text-neutral-200"
                                                        placeholder="Max"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        {/* Footer Action Buttons - Responsive Height */}
                        <div className="p-4 md:p-8 grid grid-cols-2 gap-4 border-t border-gray-100 bg-white/90 backdrop-blur-md">
                            <button
                                onClick={resetFilters}
                                className="h-12 md:h-14 border-2 border-black text-black font-black uppercase text-[10px] md:text-[12px] tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsFilterOpen(false) }}
                                className="h-12 md:h-14 bg-black text-white font-black uppercase text-[10px] md:text-[12px] tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                            >
                                Apply ({data?.total ?? 0})
                            </button>
                        </div>
                    </div>
                </motion.aside>

                {/* Products Grid - Responsive Spacing & Columns */}
                <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-hidden bg-gray-50/30">


                    <div className="mb-8 flex items-center justify-between lg:hidden">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Showing <span className="text-black">{data?.items.length ?? 0}</span> Results
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (data?.items.length ?? 0) > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16 items-start">
                            {data?.items.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: (index % 12) * 0.05 }}
                                >
                                    <ProductCard product={product as any} priority={index < 4} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 md:py-48 text-center px-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                                <FilterX className="w-8 h-8 md:w-10 md:h-10 text-gray-200" strokeWidth={1} />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-4">No results matches your selection</h2>
                            <p className="text-[9px] md:text-[11px] font-medium text-gray-400 uppercase tracking-widest max-w-xs mb-10">
                                Try adjusting your filters or use different keywords for a broader results.
                            </p>
                            <Button
                                onClick={resetFilters}
                                className="bg-black text-white px-8 md:px-12 h-12 md:h-14 font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-gray-800 transition-all rounded-none"
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
