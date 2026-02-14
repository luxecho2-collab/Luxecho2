"use client"

import * as React from "react"
import Link from "next/link"
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out-expo border-b",
                isScrolled
                    ? "h-16 bg-background/80 backdrop-blur-md border-border shadow-lg"
                    : "h-20 bg-transparent border-transparent"
            )}
        >
            <nav className="container h-full mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-neon-green flex items-center justify-center -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">
                        <span className="text-black font-bold -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">F</span>
                    </div>
                    <span className="text-xl font-bold tracking-tighter uppercase italic glow-text">
                        Funky<span className="text-neon-green">Store</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className="text-sm font-semibold uppercase tracking-widest hover:text-neon-green transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-neon-green transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-neon-green hover:bg-transparent"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="w-5 h-5" />
                    </Button>
                    <Link href="/wishlist">
                        <Button variant="ghost" size="icon" className="hover:text-neon-green hover:bg-transparent">
                            <Heart className="w-5 h-5" />
                        </Button>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-neon-green hover:bg-transparent">
                                <User className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-charcoal border-neon-green/30 text-white rounded-none">
                            <DropdownMenuItem asChild>
                                <Link href="/account" className="w-full flex hover:bg-neon-green hover:text-black cursor-pointer uppercase text-xs font-bold tracking-widest p-2">
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/account/orders" className="w-full flex hover:bg-neon-green hover:text-black cursor-pointer uppercase text-xs font-bold tracking-widest p-2">
                                    Orders
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <CartDrawer />
                </div>

                {/* Mobile Menu Trigger */}
                <div className="md:hidden flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-neon-green hover:bg-transparent"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="w-6 h-6" />
                    </Button>
                    <CartDrawer />
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-neon-green hover:bg-transparent">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-deep-black border-r border-neon-green/30 text-white w-[300px]">
                            <SheetHeader className="mb-8">
                                <SheetTitle className="text-left">
                                    <span className="text-2xl font-bold tracking-tighter uppercase italic text-white flex gap-2 items-center">
                                        <div className="w-8 h-8 bg-neon-green flex items-center justify-center -skew-x-12">
                                            <span className="text-black font-bold">F</span>
                                        </div>
                                        Funky<span className="text-neon-green">Store</span>
                                    </span>
                                </SheetTitle>
                            </SheetHeader>
                            <ul className="flex flex-col gap-6">
                                {navItems.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-lg font-bold uppercase tracking-widest hover:text-neon-green transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-12 pt-12 border-t border-neon-green/20 flex flex-col gap-4">
                                <Link
                                    href="/account"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-neon-green"
                                >
                                    <User className="w-5 h-5" /> Account
                                </Link>
                                <Link
                                    href="/account/wishlist"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-neon-green"
                                >
                                    <Heart className="w-5 h-5" /> Wishlist
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </header>
    )
}
