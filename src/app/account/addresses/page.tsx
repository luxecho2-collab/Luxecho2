"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Trash2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AuthPortal } from "@/components/auth/auth-portal"

export default function AddressesPage() {
    const { data: session, status } = useSession()
    const { toast } = useToast()
    const utils = api.useUtils()

    const { data: addresses, isLoading } = api.account.getAddresses.useQuery(undefined, {
        enabled: !!session,
    })

    const deleteAddress = api.account.deleteAddress.useMutation({
        onSuccess: () => {
            utils.account.getAddresses.invalidate()
            toast({ title: "SECTOR PURGED", description: "Address successfully removed from records." })
        }
    })

    if (status === "loading" || isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase italic">Triangulating Coordinates...</div>
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Sector 07
                    </Link>
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">ADDRESS <span className="text-neon-green">PROTOCOLS</span></h1>
                </div>
                <Button className="bg-white text-black font-black uppercase rounded-none h-14 px-8 shadow-[8px_8px_0px_#00FF41] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                    <Plus className="w-5 h-5 mr-2" /> ADD COORDINATES
                </Button>
            </div>

            {!addresses || addresses.length === 0 ? (
                <div className="py-24 text-center border-4 border-dashed border-charcoal bg-charcoal/20">
                    <MapPin className="w-16 h-16 text-charcoal mx-auto mb-4" />
                    <h2 className="text-2xl font-black uppercase italic text-muted-foreground">No Coordinates Logged</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Your deployment history requires location data.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {addresses.map((address: any) => (
                        <div key={address.id} className="bg-charcoal p-8 border-2 border-charcoal hover:border-white transition-all group relative">
                            {address.isDefault && (
                                <div className="absolute top-0 right-0 bg-neon-green text-black text-[10px] font-black uppercase px-3 py-1">
                                    PRIMARY SECTOR
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="p-3 bg-black/40 w-fit">
                                    <MapPin className="w-6 h-6 text-neon-green" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-xl uppercase tracking-tight">{address.street}</p>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {address.city}, {address.state} {address.zip}
                                    </p>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        {address.country.toUpperCase()}
                                    </p>
                                </div>

                                <div className="pt-6 flex gap-4 border-t border-white/5">
                                    <Button variant="ghost" className="h-10 rounded-none font-black uppercase text-[10px] tracking-widest hover:text-white p-0">
                                        EDIT
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        disabled={deleteAddress.isPending}
                                        onClick={() => deleteAddress.mutate({ id: address.id })}
                                        className="h-10 rounded-none font-black uppercase text-[10px] tracking-widest text-electric-pink hover:text-white p-0"
                                    >
                                        {deleteAddress.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "DELETE"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
