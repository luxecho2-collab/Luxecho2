"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { SearchOverlay } from "@/components/layout/search-overlay"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

const navItems = [
    { name: "Shop", href: "/products" },
    { name: "Collections", href: "/collections" },
    { name: "Lookbook", href: "/lookbook" },
    { name: "About", href: "/about" },
]

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)

    const { data: session } = useSession()
    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session?.user,
    })

    const wishlistCount = wishlist?.length || 0

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-gray-50 bg-white/80 backdrop-blur-md",
                isScrolled ? "h-14 shadow-[0_2px_20px_-12px_rgba(139,92,246,0.1)]" : "h-20"
            )}
        >
            <nav className="container h-full mx-auto px-6 lg:px-12 flex items-center justify-between">
                {/* Desktop Left Menu */}
                <div className="hidden md:flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 hover:opacity-70 transition-opacity"
                    >
                        <Menu className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Mobile Menu Trigger (Left) */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2"
                    >
                        <Menu className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Centralized Logo */}
                <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 group">
                    <LuxechoLogo size={36} className="group-hover:scale-110 transition-transform duration-500" />
                    <span className="text-sm font-black tracking-[0.4em] uppercase group-hover:tracking-[0.5em] transition-all duration-700">
                        Luxecho
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-1 md:gap-4">
                    <Link href="/account" className="hidden md:block">
                        <Button variant="ghost" size="icon" className="hover:bg-transparent">
                            <User className="w-5 h-5" strokeWidth={1.5} />
                        </Button>
                    </Link>
                    <Link href="/account/wishlist" className="hidden md:block">
                        <Button variant="ghost" size="icon" className="hover:bg-transparent relative">
                            <Heart className="w-5 h-5" strokeWidth={1.5} />
                            {wishlistCount > 0 && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full" />
                            )}
                        </Button>
                    </Link>
                    <CartDrawer />
                </div>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="bg-white border-r border-gray-100 p-0 w-[300px]">
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <LuxechoLogo size={28} />
                                    <span className="text-sm font-black tracking-widest uppercase">Luxecho</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6" strokeWidth={1} />
                                </button>
                            </div>
                            <ul className="flex flex-col py-4">
                                {navItems.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-6 py-4 text-sm font-medium uppercase tracking-widest border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto p-6 bg-gray-50 flex flex-col gap-4">
                                <Link
                                    href="/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest"
                                >
                                    <User className="w-4 h-4" /> Account
                                </Link>
                                <Link
                                    href="/account/wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between text-xs font-bold uppercase tracking-widest"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-4 h-4" /> Wishlist
                                    </div>
                                    {wishlistCount > 0 && (
                                        <span className="bg-black text-white px-2 py-0.5 text-[10px] rounded-full">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </header>
    )
}
