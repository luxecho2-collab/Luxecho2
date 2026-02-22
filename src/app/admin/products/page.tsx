"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Package,
    Plus,
    ExternalLink,
    MoreVertical,
    ArrowLeft,
    Search,
    Filter,
    Edit3,
    Trash2,
    LayoutDashboard,
    ShoppingBag,
    Users,
    Eye,
    FolderPlus,
    Tag as TagIcon,
    AlertCircle,
    CheckCircle2 as CheckIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAdmin } from "@/contexts/admin-context"

export default function AdminProductsPage() {
    const { isSidebarCollapsed } = useAdmin()
    const { toast } = useToast()
    const utils = api.useUtils()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [debouncedSearch, setDebouncedSearch] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<"ACTIVE" | "DRAFT" | "ARCHIVED" | undefined>(undefined)
    const [categoryFilter, setCategoryFilter] = React.useState<string | undefined>(undefined)
    const [minPrice, setMinPrice] = React.useState<number | undefined>(undefined)
    const [maxPrice, setMaxPrice] = React.useState<number | undefined>(undefined)
    const [lowStockOnly, setLowStockOnly] = React.useState(false)
    const [isFilterOpen, setIsFilterOpen] = React.useState(false)

    // Handle debouncing search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const { data: categories } = api.admin.getCategories.useQuery()
    const { data: products, isLoading } = api.admin.getProducts.useQuery({
        search: debouncedSearch,
        status: statusFilter,
        categoryId: categoryFilter,
        minPrice,
        maxPrice,
        lowStock: lowStockOnly
    }, {
        refetchInterval: 5000, // Poll every 5 seconds for "real-time" feel
    })

    const resetFilters = () => {
        setStatusFilter(undefined)
        setCategoryFilter(undefined)
        setMinPrice(undefined)
        setMaxPrice(undefined)
        setLowStockOnly(false)
        setSearchQuery("")
    }

    const deleteProduct = api.admin.deleteProduct.useMutation({
        onSuccess: () => {
            toast({ title: "PRODUCT DELETED", description: "Entry has been removed from manifest." })
            utils.admin.getProducts.invalidate()
        }
    })

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className={cn(
                "flex-grow p-10 lg:p-16 space-y-16 mx-auto transition-all duration-500",
                isSidebarCollapsed ? "max-w-[1600px]" : "max-w-7xl"
            )}>
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Center
                        </Link>
                        <h1 className={cn(
                            "font-black uppercase tracking-tighter leading-none text-black transition-all duration-500",
                            isSidebarCollapsed ? "text-6xl md:text-8xl" : "text-5xl md:text-7xl"
                        )}>
                            PRODUCT <span className="text-gray-200">LEDGER</span>
                        </h1>
                    </div>
                    <Link href="/admin/products/new">
                        <Button className="bg-black text-white font-black uppercase rounded-none h-16 px-12 text-[11px] tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_#f3f4f6] hover:shadow-none">
                            <Plus className="w-4 h-4 mr-3" /> Initial Entry
                        </Button>
                    </Link>
                </header>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <Input
                            placeholder="SEARCH BY DESIGNATION, SKU, TAGS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 pl-14 text-[10px] font-black uppercase tracking-widest"
                        />
                    </div>
                    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border border-gray-100 rounded-none h-16 px-10 gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                <Filter className="w-4 h-4" /> Filter Stream
                                {(statusFilter || categoryFilter || minPrice || maxPrice || lowStockOnly) && (
                                    <span className="w-2 h-2 bg-black rounded-full" />
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[450px] border-l border-gray-100 p-0 flex flex-col">
                            <SheetHeader className="p-10 border-b border-gray-50 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tighter">Filter Stream</SheetTitle>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Refining Data Manifest</p>
                                </div>
                                <Button variant="ghost" onClick={resetFilters} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black">Reset All</Button>
                            </SheetHeader>

                            <div className="flex-grow overflow-y-auto p-10 space-y-12">
                                {/* Lifecycle Status */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Lifecycle Status</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(["ACTIVE", "DRAFT", "ARCHIVED"] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
                                                className={cn(
                                                    "w-full h-14 px-6 flex items-center justify-between border transition-all text-[10px] font-black uppercase tracking-widest",
                                                    statusFilter === s ? "border-black bg-black text-white" : "border-gray-50 bg-gray-50 text-gray-400"
                                                )}
                                            >
                                                {s}
                                                {statusFilter === s && <CheckIcon className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Class Allocation */}
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Class Allocation</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories?.map((cat: any) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategoryFilter(categoryFilter === cat.id ? undefined : cat.id)}
                                                className={cn(
                                                    "w-full h-14 px-6 flex items-center justify-between border transition-all text-[10px] font-black uppercase tracking-widest text-left",
                                                    categoryFilter === cat.id ? "border-black bg-black text-white" : "border-gray-50 bg-gray-50 text-gray-400"
                                                )}
                                            >
                                                {cat.name}
                                                {categoryFilter === cat.id && <CheckIcon className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Valuation Range */}
                                <div className="space-y-6">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Valuation Range</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-black uppercase text-gray-300">Minimum</p>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={minPrice ?? ""}
                                                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                                                className="bg-gray-50 border-none rounded-none h-12 text-[10px] font-black"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-black uppercase text-gray-300">Maximum</p>
                                            <Input
                                                type="number"
                                                placeholder="MAX"
                                                value={maxPrice ?? ""}
                                                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                                                className="bg-gray-50 border-none rounded-none h-12 text-[10px] font-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Alert State */}
                                <div className="pt-6 border-t border-gray-50">
                                    <button
                                        onClick={() => setLowStockOnly(!lowStockOnly)}
                                        className={cn(
                                            "w-full h-16 px-6 flex items-center justify-between border transition-all",
                                            lowStockOnly ? "border-red-500 bg-red-50 text-red-600" : "border-gray-50 bg-gray-50 text-gray-400"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <AlertCircle className="w-5 h-5" />
                                            <div className="text-left">
                                                <p className="text-[10px] font-black uppercase tracking-widest">Reserve Depletion</p>
                                                <p className="text-[8px] font-medium uppercase tracking-widest mt-0.5 opacity-60">Low Stock Alert (≤ 5 units)</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 border flex items-center justify-center transition-all",
                                            lowStockOnly ? "bg-red-500 border-red-500" : "border-gray-200"
                                        )}>
                                            {lowStockOnly && <CheckIcon className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="p-10 border-t border-gray-50 bg-gray-50/50">
                                <Button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="w-full bg-black text-white font-black uppercase h-16 rounded-none text-[11px] tracking-[0.3em] shadow-xl active:scale-95 transition-all"
                                >
                                    Review {products?.length || 0} Filtered Entries
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="border border-gray-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-50">
                                <th className="p-8">Designation</th>
                                <th className="p-8">Class</th>
                                <th className="p-8">Valuation</th>
                                <th className="p-8">Reserve</th>
                                <th className="p-8">Insights</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-32 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Syncing Neural Manifest...</td></tr>
                            ) : products?.map((product: any) => (
                                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-20 bg-gray-50 border border-gray-100 flex-shrink-0 relative overflow-hidden">
                                                {product.images?.[0] && (
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        fill
                                                        className="w-full h-full object-cover"
                                                        sizes="64px"
                                                        quality={80}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black uppercase text-xs tracking-tight group-hover:translate-x-1 transition-transform">{product.name}</p>
                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1 italic">SKU: {product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 text-gray-500">
                                            {product.categories?.[0]?.name || "Unclassed"}
                                        </span>
                                    </td>
                                    <td className="p-8 font-black tabular-nums tracking-tighter">₹{product.price.toLocaleString('en-IN')}</td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                product.quantity <= 5 ? "bg-red-500" : "bg-black"
                                            )} />
                                            <span className={cn(
                                                "text-[10px] font-black tabular-nums",
                                                product.quantity <= 5 ? "text-red-500" : "text-black"
                                            )}>
                                                {product.quantity} Units
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-blue-600 border-b-2 border-r-2 border-blue-800 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                                                    <Eye className="w-3 h-3" /> VIEWS
                                                </div>
                                                <span className="text-[11px] font-black tabular-nums text-white leading-none">{product.viewCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-amber-500 border-b-2 border-r-2 border-amber-700 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                                                    <ShoppingBag className="w-3 h-3" /> ADDED
                                                </div>
                                                <span className="text-[11px] font-black tabular-nums text-white leading-none">{product.addToCartCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-emerald-500 border-b-2 border-r-2 border-emerald-700 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white">
                                                    <CheckIcon className="w-3 h-3" /> SOLD
                                                </div>
                                                <span className="text-[11px] font-black tabular-nums text-white leading-none">{product.salesCount}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}`}>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-black hover:text-white transition-all rounded-none"><Edit3 className="w-4 h-4" /></Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 transition-all rounded-none"><MoreVertical className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-none border-gray-100 min-w-[160px]">
                                                    <Link href={`/product/${product.slug}`} target="_blank">
                                                        <DropdownMenuItem className="p-3 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-50">
                                                            <ExternalLink className="w-3 h-3 mr-3" /> External View
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            if (confirm("Permanently remove this entry from manifest?")) {
                                                                deleteProduct.mutate({ id: product.id })
                                                            }
                                                        }}
                                                        className="p-3 text-[9px] font-black uppercase tracking-widest text-red-500 cursor-pointer hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-3" /> Wipe Entry
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
