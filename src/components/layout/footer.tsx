import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

const footerLinks = [
    {
        title: "Shop",
        links: [
            { name: "New Arrivals", href: "/products" },
            { name: "Featured", href: "/products" },
            { name: "Accessories", href: "/products" },
            { name: "Sale", href: "/products" },
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
            { name: "Blog", href: "/blogs" },
            { name: "Store Locator", href: "/stores" },
            { name: "Careers", href: "/careers" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="bg-white text-black border-t border-gray-100 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                    {/* Brand Info */}
                    <div className="col-span-1 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6 group">
                            <LuxechoLogo size={32} />
                            <span className="text-xl font-black tracking-[0.2em] uppercase transition-all duration-500">Luxecho</span>
                        </Link>
                        <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
                            Premium streetwear and lifestyle brand. Redefining luxury with minimalist aesthetics and exceptional quality.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="https://www.instagram.com/luxecho.official?utm_source=qr&igsh=dHF6Ym5jcXkzOXUz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                <Instagram className="w-5 h-5" strokeWidth={1.5} />
                            </a>
                            <a href="https://www.linkedin.com/company/luxechoclothingspvtltd/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors">
                                <Linkedin className="w-5 h-5" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-black uppercase tracking-widest mb-8">
                                {section.title}
                            </h3>
                            <ul className="flex flex-col gap-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-500 hover:text-black transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Luxecho. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-10">
                        <Link href="/privacy" className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest font-bold">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest font-bold">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
