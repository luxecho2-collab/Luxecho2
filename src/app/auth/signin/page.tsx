"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Github, Chrome, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignInPage() {
    const [email, setEmail] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await signIn("email", { email, callbackUrl: "/account" })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex grid lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:flex relative bg-charcoal border-r-4 border-black overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-green/10 via-transparent to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center p-24">
                    <div className="space-y-8 relative">
                        <div className="w-24 h-24 border-4 border-neon-green flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-all duration-500">
                            <Sparkles className="w-12 h-12 text-neon-green" />
                        </div>
                        <h1 className="text-8xl font-black uppercase italic italic tracking-tighter leading-[0.8]">
                            ZENZ <span className="text-neon-green">PROTO</span><br />
                            COL
                        </h1>
                        <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">Access your neural dashboard.</p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute bottom-12 left-12 font-black text-[10px] uppercase tracking-widest text-white/20">System Status: Active</div>
                <div className="absolute bottom-12 right-12 font-black text-[10px] uppercase tracking-widest text-white/20">v1.0.4.52</div>
            </div>

            {/* Auth Side */}
            <div className="flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-sm space-y-12">
                    <div className="space-y-4">
                        <div className="lg:hidden text-center mb-12">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">ZENZ / <span className="text-neon-green">HUB</span></h2>
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">IDENTITY <span className="text-neon-green">SYNC</span></h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select your authentication vector.</p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={() => signIn("google", { callbackUrl: "/account" })}
                            className="w-full h-16 rounded-none border-2 border-charcoal bg-white/5 hover:bg-white/10 hover:border-white text-white font-black uppercase tracking-widest gap-4 transition-all group"
                        >
                            <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Continue with Google
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => signIn("discord", { callbackUrl: "/account" })}
                            className="w-full h-16 rounded-none border-2 border-charcoal bg-white/5 hover:bg-white/10 hover:border-cyber-blue text-white font-black uppercase tracking-widest gap-4 transition-all group"
                        >
                            <span className="text-cyber-blue">●</span>
                            Continue with Discord
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-charcoal" /></div>
                        <div className="relative flex justify-center text-[8px] font-black uppercase italic"><span className="bg-black px-4 text-muted-foreground tracking-[0.5em]">OR NEURAL LINK</span></div>
                    </div>

                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="OPERATIVE@ZENZ.SYSTEM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 bg-charcoal border-2 border-black focus:border-neon-green rounded-none font-bold uppercase italic tracking-widest"
                                required
                            />
                        </div>
                        <Button
                            disabled={isLoading}
                            className="w-full h-16 bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all group"
                        >
                            {isLoading ? "Syncing..." : "Initialize Link"}
                            {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                        </Button>
                    </form>

                    <p className="text-center text-[8px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">
                        By initializing sync, you agree to the <br />
                        <span className="text-white hover:text-neon-green cursor-pointer">Neural Protocols</span> & <span className="text-white hover:text-neon-green cursor-pointer">Data Privacy Act</span>.
                    </p>
                </div>
            </div>
        </div>
    )
}
