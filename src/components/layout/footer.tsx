import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = [
    {
        title: "Shop",
        links: [
            { name: "New Arrivals", href: "/collections/new-arrivals" },
            { name: "Featured", href: "/collections/featured" },
            { name: "Accessories", href: "/collections/accessories" },
            { name: "Sale", href: "/collections/sale" },
        ],
    },
    {
        title: "Support",
        links: [
            { name: "Order Tracking", href: "/account/orders" },
            { name: "Shipping Policy", href: "/shipping" },
            { name: "Returns & Exchanges", href: "/returns" },
            { name: "FAQ", href: "/faq" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About Us", href: "/about" },
            { name: "Contact", href: "/contact" },
            { name: "Store Locator", href: "/stores" },
            { name: "Careers", href: "/careers" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="bg-deep-black text-white border-t border-neon-green/20 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Logo & Info */}
                    <div className="col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 bg-neon-green flex items-center justify-center -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">
                                <span className="text-black text-lg font-bold -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">F</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight uppercase italic glow-text">
                                Funky<span className="text-neon-green">Store</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground mb-8 max-w-sm">
                            Pushing the boundaries of fashion and digital experience. Neo-brutalist aesthetics meet high-performance streetwear.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 border border-neon-green/30 flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 border border-neon-green/30 flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 border border-neon-green/30 flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 border border-neon-green/30 flex items-center justify-center hover:bg-neon-green hover:text-black transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-neon-green">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-neon-green transition-colors uppercase tracking-widest"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter / Bottom */}
                <div className="pt-8 border-t border-neon-green/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} FUNKY STORE. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-[10px] text-muted-foreground hover:text-neon-green uppercase font-bold tracking-[0.2em]">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-neon-green uppercase font-bold tracking-[0.2em]">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
