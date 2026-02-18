"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Shield, Bell, ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { AuthPortal } from "@/components/auth/auth-portal"

export default function SettingsPage() {
    const { data: session, status, update } = useSession()
    const { toast } = useToast()
    const [name, setName] = React.useState("")

    React.useEffect(() => {
        if (session?.user?.name) setName(session.user.name)
    }, [session])

    const updateProfile = api.account.updateProfile.useMutation({
        onSuccess: async () => {
            await update()
            toast({ title: "PROTOCOL UPDATED", description: "Your neural signature has been modified." })
        }
    })

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase italic">Accessing Core Settings...</div>
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-12 space-y-4">
                <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sector 07
                </Link>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">SYSTEM <span className="text-neon-green">CONFIG</span></h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Neural Sections</p>
                    <nav className="flex flex-col gap-2">
                        <Button variant="ghost" className="justify-start rounded-none font-black uppercase italic tracking-widest border-l-4 border-neon-green bg-charcoal">PROFILE</Button>
                        <Button variant="ghost" className="justify-start rounded-none font-black uppercase italic tracking-widest border-l-4 border-transparent text-muted-foreground hover:text-white">SECURITY</Button>
                        <Button variant="ghost" className="justify-start rounded-none font-black uppercase italic tracking-widest border-l-4 border-transparent text-muted-foreground hover:text-white">NOTIFICATIONS</Button>
                    </nav>
                </div>

                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-8 bg-charcoal p-8 border-2 border-black">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <Settings className="w-6 h-6 text-neon-green" />
                            <h2 className="text-xl font-black uppercase italic">PROFILE MODIFICATION</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Name (Display)</Label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-black border-2 border-charcoal focus:border-neon-green rounded-none h-14 font-bold text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Access (Read-Only)</Label>
                                <Input
                                    value={session.user.email ?? ""}
                                    disabled
                                    className="bg-black/50 border-2 border-charcoal rounded-none h-14 font-bold text-white/50 cursor-not-allowed"
                                />
                            </div>

                            <Button
                                disabled={updateProfile.isPending}
                                onClick={() => updateProfile.mutate({ name })}
                                className="w-full bg-neon-green text-black font-black uppercase rounded-none h-16 shadow-[8px_8px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                {updateProfile.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <><Save className="w-5 h-5 mr-3" /> COMMIT CHANGES</>
                                )}
                            </Button>
                        </div>
                    </section>

                    <section className="space-y-8 bg-black p-8 border-2 border-charcoal opacity-50 pointer-events-none">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                            <Shield className="w-6 h-6 text-white" />
                            <h2 className="text-xl font-black uppercase italic text-white/50">ENCRYPTION LEVEL</h2>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Level 4 Encryption Active. No modifications required.</p>
                    </section>
                </div>
            </div>
        </div>
    )
}
