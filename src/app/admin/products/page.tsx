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
    Tag as TagIcon
} from "lucide-react"
import Link from "next/link"
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

export default function AdminProductsPage() {
    const { toast } = useToast()
    const utils = api.useUtils()
    const { data: products, isLoading } = api.admin.getProducts.useQuery({})

    const deleteProduct = api.admin.deleteProduct.useMutation({
        onSuccess: () => {
            toast({ title: "PRODUCT DELETED", description: "Entry has been removed from manifest." })
            utils.admin.getProducts.invalidate()
        }
    })

    return (
        <div className="flex min-h-screen bg-white text-black">
            {/* Minimalist Sidebar */}
            <aside className="w-72 border-r border-gray-100 bg-white hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="p-10 border-b border-gray-50 flex items-center gap-3">
                    <LuxechoLogo size={28} />
                    <span className="text-sm font-black uppercase tracking-[0.4em]">Admin</span>
                </div>
                <nav className="p-6 flex-grow flex flex-col gap-1">
                    {[
                        { name: "Dashboard Overview", icon: LayoutDashboard, href: "/admin", active: false },
                        { name: "Product Catalog", icon: Package, href: "/admin/products", active: true },
                        { name: "Category Matrix", icon: FolderPlus, href: "/admin/categories", active: false },
                        { name: "Filter Attributes", icon: TagIcon, href: "/admin/attributes", active: false },
                        { name: "Orders & Fulfillment", icon: ShoppingBag, href: "/admin/orders", active: false },
                        { name: "Customer Relations", icon: Users, href: "/admin/customers", active: false },
                    ].map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase tracking-widest gap-4 px-6 transition-all duration-300",
                                    item.active
                                        ? "bg-black text-white hover:bg-black hover:text-white"
                                        : "text-gray-400 hover:text-black hover:bg-gray-50"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[10px]">{item.name}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Center
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-black">
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
                            placeholder="SEARCH BY DESIGNATION..."
                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 pl-14 text-[10px] font-black uppercase tracking-widest"
                        />
                    </div>
                    <Button variant="outline" className="border border-gray-100 rounded-none h-16 px-10 gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        <Filter className="w-4 h-4" /> Filter Stream
                    </Button>
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
                                                    <img src={product.images[0].url} className="w-full h-full object-cover" />
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
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-300">
                                                <Eye className="w-3 h-3" /> {product.viewCount} Views
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-black">
                                                <ShoppingBag className="w-3 h-3" /> {product.salesCount} Sales
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
                                                    <DropdownMenuItem className="p-3 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-50">
                                                        <ExternalLink className="w-3 h-3 mr-3" /> External View
                                                    </DropdownMenuItem>
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
