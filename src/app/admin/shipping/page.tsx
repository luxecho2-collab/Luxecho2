"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { Save, Truck, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useToast } from "@/hooks/use-toast"

export default function AdminShippingPage() {
    const { toast } = useToast()
    const utils = api.useUtils()

    const { data: settings, isLoading } = api.admin.getShippingSettings.useQuery()

    const [expressPrice, setExpressPrice] = React.useState("")
    const [expressLabel, setExpressLabel] = React.useState("")
    const [expressDays, setExpressDays] = React.useState("")

    React.useEffect(() => {
        if (settings) {
            setExpressPrice(String(settings.expressPrice))
            setExpressLabel(settings.expressLabel)
            setExpressDays(settings.expressDays)
        }
    }, [settings])

    const update = api.admin.updateShippingSettings.useMutation({
        onSuccess: () => {
            utils.admin.getShippingSettings.invalidate()
            toast({ title: "SHIPPING UPDATED", description: "Live on the checkout page immediately." })
        },
        onError: (e) => {
            toast({ title: "Error", description: e.message, variant: "destructive" })
        }
    })

    const handleSave = () => {
        const price = parseFloat(expressPrice)
        if (isNaN(price) || price < 0) {
            toast({ title: "Invalid price", description: "Enter a valid positive number.", variant: "destructive" })
            return
        }
        update.mutate({ expressPrice: price, expressLabel, expressDays })
    }

    return (
        <main className="p-8 md:p-12 space-y-10 max-w-3xl">
            <header className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-tight text-black">Shipping Settings</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-black/40">Manage delivery timelines and costs</p>
            </header>

            {isLoading ? (
                <div className="flex items-center gap-3 text-black/40 font-bold uppercase text-xs">
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Loading settings...
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Standard Shipping (Read-only) */}
                    <div className="border border-black/10 p-6 space-y-6 relative overflow-hidden bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-black" />
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-sm text-black">Standard Shipping</h3>
                                    <p className="text-[10px] uppercase font-bold text-black/40">3–7 Business Days</p>
                                </div>
                            </div>
                            <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                FREE
                            </span>
                        </div>
                    </div>

                    {/* Express Shipping (Editable) */}
                    <div className="border border-black p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-black/10 pb-4">
                            <Truck className="w-5 h-5 text-black" />
                            <h3 className="font-black uppercase tracking-widest text-sm text-black">Express Shipping</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-black/50">Display Name</Label>
                                <Input
                                    value={expressLabel}
                                    onChange={e => setExpressLabel(e.target.value)}
                                    className="rounded-none border-black/20 h-12 focus-visible:ring-0 focus-visible:border-black font-bold"
                                    placeholder="e.g. Express Shipping"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-black/50">Delivery Timeline</Label>
                                <Input
                                    value={expressDays}
                                    onChange={e => setExpressDays(e.target.value)}
                                    className="rounded-none border-black/20 h-12 focus-visible:ring-0 focus-visible:border-black font-bold"
                                    placeholder="e.g. 1–2 Business Days"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-black/50">Price (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black/40 text-sm">₹</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={expressPrice}
                                        onChange={e => setExpressPrice(e.target.value)}
                                        className="rounded-none border-black/20 h-12 pl-8 focus-visible:ring-0 focus-visible:border-black font-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={update.isPending}
                            className="w-full h-12 rounded-none bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-black/90 transition-all disabled:opacity-50 mt-4"
                        >
                            {update.isPending ? "Saving..." : "Save Shipping Settings"}
                        </Button>
                    </div>
                </div>
            )}
        </main>
    )
}
