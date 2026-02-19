"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    FolderPlus,
    Tag as TagIcon,
    FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

export function AdminSidebar() {
    const pathname = usePathname()

    const navItems = [
        { name: "Dashboard Overview", icon: LayoutDashboard, href: "/admin" },
        { name: "Product Catalog", icon: Package, href: "/admin/products" },
        { name: "Category Matrix", icon: FolderPlus, href: "/admin/categories" },
        { name: "Filter Attributes", icon: TagIcon, href: "/admin/attributes" },
        { name: "Orders & Fulfillment", icon: ShoppingBag, href: "/admin/orders" },
        { name: "Customer Relations (CRM)", icon: Users, href: "/admin/customers" },
        { name: "Blog Editorial", icon: FileText, href: "/admin/blog" },
    ]

    return (
        <aside className="w-72 border-r border-gray-100 bg-white hidden lg:flex flex-col sticky top-0 h-screen">
            <div className="p-10 border-b border-gray-50 flex items-center gap-3">
                <LuxechoLogo size={28} />
                <span className="text-sm font-black uppercase tracking-[0.4em]">
                    Admin
                </span>
            </div>
            <nav className="p-6 flex-grow flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    return (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase tracking-widest gap-4 px-6 transition-all duration-300",
                                    isActive
                                        ? "bg-black text-white hover:bg-black/90 hover:text-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                                        : "text-gray-400 hover:text-black hover:bg-gray-50"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-[10px]">{item.name}</span>
                            </Button>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-8 border-t border-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold">VK</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black">Administrator</p>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Superuser Access</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
