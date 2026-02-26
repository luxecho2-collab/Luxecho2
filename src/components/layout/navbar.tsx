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
import { usePathname } from "next/navigation"

const navItems = [
    { name: "Shop", href: "/products" },
    { name: "Blog", href: "/blogs" },
]

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)

    const { data: session } = useSession()
    const { data: wishlist } = api.account.getWishlist.useQuery(undefined, {
        enabled: !!session?.user,
    })
    const { data: announcement } = api.cms.getActiveAnnouncement.useQuery()
    const pathname = usePathname()
    const isHomepage = pathname === "/"

    const wishlistCount = wishlist?.length || 0
    // Sit below the announcement bar when it's active (36px = h-9)
    const topOffset = announcement ? 36 : 0

    React.useEffect(() => {
        setIsSearchOpen(false)
        setIsMobileMenuOpen(false)
    }, [pathname])

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Transparent + white text on the entire homepage; solid everywhere else
    const isTransparent = isHomepage

    return (
        <>
            <header
                style={{ top: topOffset }}
                className={cn(
                    "fixed left-0 right-0 z-50 transition-all duration-500",
                    isScrolled ? "h-14 shadow-[0_2px_20px_-12px_rgba(194,126,105,0.15)]" : "h-20",
                    isTransparent
                        ? "bg-transparent"
                        : "bg-brand-cream/95 backdrop-blur-md border-b border-brand-copper/10"
                )}
            >
                <nav className="container h-full mx-auto px-6 lg:px-12 flex items-center justify-between">
                    {/* Desktop Left Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-bold uppercase tracking-widest transition-colors",
                                    isTransparent ? "text-white hover:text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "text-brand-charcoal hover:text-brand-copper"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Trigger (Left) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={cn("p-2 -ml-2 transition-all duration-300", isTransparent ? "text-white hover:scale-110 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "hover:text-brand-copper")}
                        >
                            <Menu className={cn(isTransparent ? "w-8 h-8" : "w-7 h-7")} strokeWidth={isTransparent ? 2.5 : 1.5} />
                        </button>
                    </div>

                    {/* Centralized Logo */}
                    <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3 group">
                        <LuxechoLogo size={36} className="group-hover:scale-105 transition-transform duration-700" />
                        <span className={cn("text-lg md:text-xl font-serif tracking-tight group-hover:tracking-wider transition-all duration-700 font-black", isTransparent ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : "text-brand-charcoal")}>
                            luxecho
                        </span>
                    </Link>

                    {/* Right Actions */}
                    <div className={cn("flex items-center gap-0 md:gap-2", isTransparent ? "text-white" : "text-brand-charcoal")}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchOpen(true)}
                            className={cn("w-10 h-10 transition-all duration-300", isTransparent ? "hover:bg-white/20 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "hover:bg-black/5")}
                        >
                            <Search className={cn(isTransparent ? "w-7 h-7" : "w-6 h-6")} strokeWidth={isTransparent ? 2.5 : 1.5} />
                        </Button>
                        <Link href="/account" className="hidden md:block">
                            <Button variant="ghost" size="icon" className={cn("w-10 h-10 transition-all duration-300", isTransparent ? "hover:bg-white/20 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "hover:bg-black/5")}>
                                <User className={cn(isTransparent ? "w-7 h-7" : "w-6 h-6")} strokeWidth={isTransparent ? 2.5 : 1.5} />
                            </Button>
                        </Link>
                        <Link href="/account/wishlist" className="hidden md:block">
                            <Button variant="ghost" size="icon" className={cn("w-10 h-10 transition-all duration-300 relative", isTransparent ? "hover:bg-white/20 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" : "hover:bg-black/5")}>
                                <Heart className={cn(isTransparent ? "w-7 h-7" : "w-6 h-6")} strokeWidth={isTransparent ? 2.5 : 1.5} />
                                {wishlistCount > 0 && (
                                    <span className={cn("absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full", isTransparent ? "bg-white" : "bg-black")} />
                                )}
                            </Button>
                        </Link>
                        <CartDrawer isTransparent={isTransparent} />
                    </div>

                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetContent side="left" className="bg-white border-r border-gray-100 p-0 w-[300px]">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col h-full">
                                <div className="p-6 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <LuxechoLogo size={32} />
                                        <span className="text-lg font-serif text-brand-charcoal">luxecho</span>
                                    </div>
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
                                            <Heart className="w-6 h-" /> Wishlist
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

            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    )
}
