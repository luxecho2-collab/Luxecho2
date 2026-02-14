"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { ProductCard } from "@/components/product/product-card"
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Filter,
    Search,
    X,
    SlidersHorizontal,
    ChevronDown,
    LayoutGrid,
    List as ListIcon,
    ShoppingBag
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
    const [search, setSearch] = React.useState("")
    const [categoryId, setCategoryId] = React.useState<string | undefined>(undefined)
    const [minPrice, setMinPrice] = React.useState<number | undefined>(undefined)
    const [maxPrice, setMaxPrice] = React.useState<number | undefined>(undefined)
    const [sort, setSort] = React.useState<"newest" | "price_asc" | "price_desc">("newest")

    // Fetch data
    const { data: categories } = api.product.getCategories.useQuery()
    const { data, isLoading } = api.product.list.useQuery({
        categoryId,
        minPrice,
        maxPrice,
        search,
        sort,
        take: 24,
    })

    const activeFiltersCount = [categoryId, minPrice, maxPrice, search].filter(Boolean).length

    const resetFilters = () => {
        setSearch("")
        setCategoryId(undefined)
        setMinPrice(undefined)
        setMaxPrice(undefined)
        setSort("newest")
    }

    const sortLabels = {
        newest: "Newest Arrivals",
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low",
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-4 border-black pb-8">
                <div className="space-y-2">
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                        GEAR <span className="text-neon-green">/ COLLECT</span>
                    </h1>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
                        {data?.total ?? 0} ITEMS DEPLOYED IN NEON CITY
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group flex-grow md:flex-grow-0">
                        <Input
                            placeholder="SEARCH PROTOCOL..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-64 bg-charcoal border-2 border-charcoal focus:border-neon-green rounded-none h-12 text-white font-black uppercase text-xs pl-12 transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-neon-green transition-colors" />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 border-2 border-black rounded-none px-6 font-black uppercase text-xs flex items-center gap-2 hover:bg-black hover:text-white transition-all">
                                {sortLabels[sort]}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-charcoal border-2 border-black rounded-none p-2 space-y-1">
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <DropdownMenuItem
                                    key={key}
                                    onClick={() => setSort(key as any)}
                                    className={cn(
                                        "font-black uppercase text-[10px] tracking-widest p-3 cursor-pointer rounded-none focus:bg-neon-green focus:text-black",
                                        sort === key ? "bg-neon-green text-black" : "text-white"
                                    )}
                                >
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Desktop Sidebar Filters */}
                <aside className="hidden lg:block w-72 space-y-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-neon-green" />
                            Filters
                        </h2>
                        {activeFiltersCount > 0 && (
                            <Button variant="ghost" onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest h-auto p-0 hover:text-electric-pink">
                                Reset All
                            </Button>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* Categories */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={categoryId === undefined ? "default" : "outline"}
                                    onClick={() => setCategoryId(undefined)}
                                    className={cn(
                                        "rounded-none font-black uppercase text-[10px] h-9 px-4",
                                        categoryId === undefined ? "bg-neon-green text-black" : "border-charcoal text-white hover:border-white"
                                    )}
                                >
                                    All Gear
                                </Button>
                                {categories?.map((cat: any) => (
                                    <Button
                                        key={cat.id}
                                        variant={categoryId === cat.id ? "default" : "outline"}
                                        onClick={() => setCategoryId(cat.id)}
                                        className={cn(
                                            "rounded-none font-black uppercase text-[10px] h-9 px-4",
                                            categoryId === cat.id ? "bg-neon-green text-black" : "border-charcoal text-white hover:border-white"
                                        )}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-charcoal" />

                        {/* Price Range */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price Range</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <Label className="text-[8px] uppercase font-black text-muted-foreground ml-1">Min $</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice ?? ""}
                                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                                        className="bg-charcoal border-none rounded-none h-10 font-black text-xs"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <Label className="text-[8px] uppercase font-black text-muted-foreground ml-1">Max $</Label>
                                    <Input
                                        type="number"
                                        placeholder="999"
                                        value={maxPrice ?? ""}
                                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                                        className="bg-charcoal border-none rounded-none h-10 font-black text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Promo Banner */}
                    <div className="bg-neon-green p-6 mt-12 rotate-2 shadow-[8px_8px_0px_#000]">
                        <h4 className="text-black font-black uppercase italic leading-tight text-xl mb-2">Join the Resistance</h4>
                        <p className="text-black font-bold text-[10px] uppercase leading-relaxed">
                            Sign up for our neural feed and get 15% off your first drop.
                        </p>
                        <Button className="mt-4 bg-black text-white rounded-none font-black uppercase text-[10px] w-full h-10">
                            Plug in now
                        </Button>
                    </div>
                </aside>

                {/* Mobile Filter Trigger */}
                <div className="lg:hidden flex justify-between items-center mb-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full border-2 border-black rounded-none h-14 font-black uppercase flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5" />
                                Filter gear
                                {activeFiltersCount > 0 && (
                                    <span className="bg-neon-green text-black w-5 h-5 flex items-center justify-center text-[10px] rounded-full ml-2">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-charcoal border-t-4 border-neon-green rounded-t-[2rem] p-8 h-[80vh]">
                            <SheetHeader className="mb-8">
                                <div className="flex justify-between items-center">
                                    <SheetTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">FILTER GEAR</SheetTitle>
                                    <Button variant="ghost" onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest h-auto p-0 text-neon-green">Reset All</Button>
                                </div>
                            </SheetHeader>
                            {/* Mobile Filters implemented here... simplified for now */}
                            <div className="space-y-8 overflow-y-auto max-h-[60vh] pb-12">
                                <div className="space-y-4">
                                    <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground">Categories</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Same as desktop but larger targets */}
                                        {categories?.map((cat: any) => (
                                            <Button
                                                key={cat.id}
                                                variant={categoryId === cat.id ? "default" : "outline"}
                                                onClick={() => setCategoryId(cat.id)}
                                                className={cn("rounded-none font-black uppercase text-xs h-12 px-6", categoryId === cat.id ? "bg-neon-green text-black" : "border-white/20 text-white")}
                                            >
                                                {cat.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                {/* Add more mobile filters if needed */}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Main Product Grid */}
                <main className="flex-grow">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (data?.items.length ?? 0) > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                            {data?.items.map((product: any) => (
                                <ProductCard key={product.id} product={product as any} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-charcoal">
                            <ShoppingBag className="w-16 h-16 text-charcoal mb-4" />
                            <h2 className="text-2xl font-black uppercase italic mb-2 text-muted-foreground">Null results detected</h2>
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest max-w-xs text-center">
                                The specified parameters did not yield any gear. Try broadening your scan.
                            </p>
                            <Button variant="outline" onClick={resetFilters} className="mt-8 border-2 border-white rounded-none uppercase font-black italic">
                                Reset scan protocol
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
