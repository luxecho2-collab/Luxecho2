"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Tag,
    Plus,
    Trash2,
    ArrowLeft,
    Clock,
    Percent,
    DollarSign,
    Calendar,
    Users
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function AdminCouponsPage() {
    const { toast } = useToast()
    const utils = api.useUtils()
    const { data: coupons, isLoading } = api.admin.getCoupons.useQuery()

    const deleteCoupon = api.admin.deleteCoupon.useMutation({
        onSuccess: () => {
            utils.admin.getCoupons.invalidate()
            toast({ title: "PROTOCOL DELETED", description: "Discount code has been purged from system." })
        }
    })

    return (
        <div className="flex min-h-screen bg-black text-white">
            <aside className="w-64 border-r-4 border-black bg-charcoal hidden lg:flex flex-col">
                <div className="p-8 border-b-4 border-black">
                    <span className="text-2xl font-black uppercase italic tracking-tighter">
                        ADM <span className="text-neon-green">/ HUB</span>
                    </span>
                </div>
                <nav className="p-4 flex-grow space-y-2">
                    {[
                        { name: "DASHBOARD", href: "/admin" },
                        { name: "PRODUCTS", href: "/admin/products" },
                        { name: "ORDERS", href: "/admin/orders" },
                        { name: "CUSTOMERS", href: "/admin/customers" },
                        { name: "COUPONS", href: "/admin/coupons", active: true },
                    ].map((item) => (
                        <Link key={item.name} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start rounded-none h-14 font-black uppercase italic tracking-widest gap-4 px-4 border-2",
                                    item.active ? "border-neon-green bg-black text-white" : "border-transparent text-muted-foreground hover:text-white"
                                )}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="flex-grow p-8 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-4 border-white/5 pb-8">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Command Center
                        </Link>
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                            DISCOUNT <span className="text-neon-green">/ CODES</span>
                        </h1>
                    </div>
                    <Button className="bg-neon-green text-black font-black uppercase rounded-none h-16 px-12 shadow-[8px_8px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        <Plus className="w-6 h-6 mr-2" /> GENERATE CODE
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <div className="col-span-full py-24 text-center font-black uppercase italic animate-pulse">Syncing Discount Protocols...</div>
                    ) : coupons?.length === 0 ? (
                        <div className="col-span-full py-24 text-center border-4 border-dashed border-charcoal">
                            <Tag className="w-16 h-16 text-charcoal mx-auto mb-4" />
                            <h2 className="text-2xl font-black uppercase italic text-muted-foreground">No Discount Protocols Active</h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Initialize gear reductions via the generator.</p>
                        </div>
                    ) : coupons?.map((coupon: any) => (
                        <div key={coupon.id} className="bg-charcoal p-8 border-2 border-charcoal hover:border-white transition-all group relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-black/40 border border-white/10">
                                    {coupon.discountType === "PERCENTAGE" ? <Percent className="w-6 h-6 text-neon-green" /> : <DollarSign className="w-6 h-6 text-neon-green" />}
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => deleteCoupon.mutate({ id: coupon.id })}
                                    className="text-muted-foreground hover:text-electric-pink p-0 h-fit"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">{coupon.code}</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{coupon.description || "NO DESIGNATION"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">VALUE</p>
                                        <p className="font-black text-xl italic tabular-nums">
                                            {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">USAGE</p>
                                        <p className="font-black text-xl italic tabular-nums">
                                            {coupon.usageCount} <span className="text-[10px] text-muted-foreground">/ {coupon.usageLimit || "∞"}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Clock className="w-3 h-3 text-neon-green" />
                                        EXPIRES: {coupon.endDate ? format(new Date(coupon.endDate), "MMM dd, yyyy") : "NEVER"}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Calendar className="w-3 h-3 text-cyber-blue" />
                                        CREATED: {format(new Date(coupon.createdAt), "MMM dd, yyyy")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
