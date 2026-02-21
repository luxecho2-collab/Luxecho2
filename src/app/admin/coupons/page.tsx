"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Tag, Plus, Trash2, ArrowLeft, Clock, Percent, IndianRupee, Calendar, X,
    Users, CalendarDays, Save
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

const DEFAULT_FORM = {
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    minOrderAmount: "",
    usageLimit: "",
    endDate: "",
}

export default function AdminCouponsPage() {
    const { toast } = useToast()
    const utils = api.useUtils()
    const { data: coupons, isLoading } = api.admin.getCoupons.useQuery()

    const [showForm, setShowForm] = React.useState(false)
    const [form, setForm] = React.useState(DEFAULT_FORM)

    const deleteCoupon = api.admin.deleteCoupon.useMutation({
        onSuccess: () => {
            utils.admin.getCoupons.invalidate()
            toast({ title: "COUPON DELETED", description: "The discount code has been removed." })
        }
    })

    const createCoupon = api.admin.createCoupon.useMutation({
        onSuccess: () => {
            utils.admin.getCoupons.invalidate()
            setShowForm(false)
            setForm(DEFAULT_FORM)
            toast({ title: "COUPON CREATED", description: `Code ${form.code.toUpperCase()} is now live.` })
        },
        onError: (e) => {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        }
    })

    const handleCreate = () => {
        if (!form.code || !form.discountValue) {
            toast({ title: "Missing fields", description: "Code and discount value are required.", variant: "destructive" })
            return
        }

        const dValue = parseFloat(form.discountValue);
        if (isNaN(dValue) || dValue <= 0) {
            toast({ title: "Invalid details", description: "Discount must be a positive number.", variant: "destructive" });
            return;
        }

        createCoupon.mutate({
            code: form.code,
            description: form.description || undefined,
            discountType: form.discountType,
            discountValue: dValue,
            minOrderAmount: form.minOrderAmount && !isNaN(parseFloat(form.minOrderAmount)) ? parseFloat(form.minOrderAmount) : undefined,
            usageLimit: form.usageLimit && !isNaN(parseInt(form.usageLimit)) ? parseInt(form.usageLimit) : undefined,
            endDate: form.endDate ? new Date(form.endDate) : undefined,
        })
    }

    return (
        <main className="p-8 md:p-12 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-3">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-5xl font-black uppercase tracking-tight">Coupon Codes</h1>
                </div>
                <Button
                    onClick={() => setShowForm(v => !v)}
                    className="bg-black text-white font-black uppercase rounded-none h-14 px-10 hover:bg-black/90 gap-2"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Create Coupon"}
                </Button>
            </header>

            {showForm && (
                <div className="bg-gray-50 border border-gray-100 p-8 space-y-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <h2 className="text-sm font-black uppercase tracking-widest">New Coupon Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Coupon Code</Label>
                            <Input
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER50"
                                className="h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-black uppercase text-lg tracking-wider"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description (Optional)</Label>
                            <Input
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Summer sale discount"
                                className="h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Discount Type</Label>
                            <div className="flex border border-gray-300 p-1 bg-white">
                                <button
                                    onClick={() => setForm({ ...form, discountType: "PERCENTAGE" })}
                                    className={cn("flex-1 h-10 text-xs font-black uppercase tracking-widest transition-colors", form.discountType === "PERCENTAGE" ? "bg-black text-white" : "text-gray-400 hover:text-black")}
                                >Percentage</button>
                                <button
                                    onClick={() => setForm({ ...form, discountType: "FIXED" })}
                                    className={cn("flex-1 h-10 text-xs font-black uppercase tracking-widest transition-colors", form.discountType === "FIXED" ? "bg-black text-white" : "text-gray-400 hover:text-black")}
                                >Fixed Amount</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                Discount Value {form.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}
                            </Label>
                            <div className="relative">
                                {form.discountType === "FIXED" && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>}
                                {form.discountType === "PERCENTAGE" && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>}
                                <Input
                                    type="number"
                                    min="0"
                                    value={form.discountValue}
                                    onChange={e => setForm({ ...form, discountValue: e.target.value })}
                                    className={cn("h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-black text-lg", form.discountType === "FIXED" ? "pl-8" : "", form.discountType === "PERCENTAGE" ? "pr-8" : "")}
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Min Order Amount (₹) (Optional)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={form.minOrderAmount}
                                onChange={e => setForm({ ...form, minOrderAmount: e.target.value })}
                                className="h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-medium"
                                placeholder="e.g. 5000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Usage Limit (Optional)</Label>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    value={form.usageLimit}
                                    onChange={e => setForm({ ...form, usageLimit: e.target.value })}
                                    className="h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-medium"
                                    placeholder="Leave blank for unlimited"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Expiry Date (Optional)</Label>
                            <div>
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                                    className="h-12 rounded-none border-gray-300 focus-visible:ring-0 focus:border-black font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="h-12 flex-1 rounded-none border-gray-300 text-black uppercase font-black text-xs hover:bg-gray-100"
                        >Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createCoupon.isPending}
                            className="bg-black text-white font-black uppercase tracking-widest rounded-none h-12 flex-[2] hover:bg-black/90 gap-3"
                        >
                            <Save className="w-4 h-4" />
                            {createCoupon.isPending ? "Saving..." : "Create Coupon"}
                        </Button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-16 text-center text-gray-300 font-black uppercase animate-pulse">Loading coupons...</div>
            ) : coupons?.length === 0 ? (
                <div className="border border-dashed border-gray-300 p-16 text-center space-y-4 bg-gray-50">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto" strokeWidth={1} />
                    <div>
                        <p className="font-black uppercase tracking-widest text-black">No Active Coupons</p>
                        <p className="text-xs font-medium text-gray-500 mt-2">Create your first coupon code above.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons?.map((coupon: any) => (
                        <div key={coupon.id} className="border border-gray-200 p-6 flex flex-col hover:border-black transition-colors group relative overflow-hidden">
                            {!coupon.isActive && <div className="absolute top-0 right-0 py-1 px-3 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest">Inactive</div>}

                            <div className="flex border-b border-gray-100 pb-4 mb-4 items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-black text-xl tracking-tight text-black">{coupon.code}</p>
                                    <span className="inline-block bg-black/5 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if (confirm("Delete this coupon?")) deleteCoupon.mutate({ id: coupon.id })
                                    }}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all -mr-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <Clock className="w-3 h-3" />
                                Expires: {coupon.endDate ? format(new Date(coupon.endDate), "MMM dd, yyyy") : "Never"}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                Created: {format(new Date(coupon.createdAt), "MMM dd, yyyy")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
