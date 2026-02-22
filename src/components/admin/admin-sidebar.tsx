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
    Layers,
    Truck,
    Percent,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"
import { useAdmin } from "@/contexts/admin-context"

export function AdminSidebar() {
    const pathname = usePathname()
    const { isSidebarCollapsed, toggleSidebar } = useAdmin()

    const navItems = [
        { name: "Dashboard Overview", icon: LayoutDashboard, href: "/admin" },
        { name: "Homepage CMS", icon: Layers, href: "/admin/hero-slides" },
        { name: "Product Catalog", icon: Package, href: "/admin/products" },
        { name: "Category Matrix", icon: FolderPlus, href: "/admin/categories" },
        { name: "Filter Attributes", icon: TagIcon, href: "/admin/attributes" },
        { name: "Orders & Fulfillment", icon: ShoppingBag, href: "/admin/orders" },
        { name: "Customer Relations (CRM)", icon: Users, href: "/admin/customers" },
        { name: "Coupon Codes", icon: Percent, href: "/admin/coupons" },
        { name: "Shipping Settings", icon: Truck, href: "/admin/shipping" },
        { name: "Blog Editorial", icon: FileText, href: "/admin/blog" },
    ]

    return (
        <aside className={cn(
            "border-r border-gray-100 bg-white hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out group/sidebar",
            isSidebarCollapsed ? "w-24" : "w-72"
        )}>
            <div className={cn(
                "p-10 border-b border-gray-50 flex items-center justify-between transition-all duration-500",
                isSidebarCollapsed ? "p-6 justify-center" : "p-10"
            )}>
                <div className="flex items-center gap-3">
                    <LuxechoLogo size={28} />
                    {!isSidebarCollapsed && (
                        <span className="text-sm font-black uppercase tracking-[0.4em] animate-in fade-in duration-500">
                            Admin
                        </span>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-8 w-8 hover:bg-gray-50 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
                    >
                        <PanelLeftClose className="w-4 h-4 text-gray-400" />
                    </Button>
                )}
            </div>

            <nav className={cn(
                "flex-grow flex flex-col gap-1 transition-all duration-500",
                isSidebarCollapsed ? "p-4" : "p-6"
            )}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    return (
                        <Link key={item.name} href={item.href} title={isSidebarCollapsed ? item.name : undefined}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full rounded-none h-14 font-black uppercase tracking-widest gap-4 transition-all duration-300",
                                    isSidebarCollapsed ? "justify-center px-0" : "justify-start px-6",
                                    isActive
                                        ? "bg-black text-white hover:bg-black/90 hover:text-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                                        : "text-gray-400 hover:text-black hover:bg-gray-50"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive ? "scale-110" : "")} />
                                {!isSidebarCollapsed && <span className="text-[10px] animate-in slide-in-from-left-2 duration-300">{item.name}</span>}
                            </Button>
                        </Link>
                    )
                })}
            </nav>

            {isSidebarCollapsed && (
                <div className="p-4 border-t border-gray-50 flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-10 w-10 hover:bg-gray-100"
                    >
                        <PanelLeftOpen className="w-5 h-5 text-black" />
                    </Button>
                </div>
            )}

            {!isSidebarCollapsed && (
                <div className="p-8 border-t border-gray-50 animate-in fade-in duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-black">VK</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black">Administrator</p>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Superuser Access</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
