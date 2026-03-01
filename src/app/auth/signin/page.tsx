"use client"

import * as React from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Chrome,
    Loader2,
    ChevronRight,
    Lock,
    ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

function SignInContent() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/admin"
    const errorParam = searchParams.get("error")

    const [email, setEmail] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const { toast } = useToast()

    // Redirect if logged in
    React.useEffect(() => {
        if (status === "authenticated") {
            router.push(callbackUrl)
        }
    }, [status, router, callbackUrl])

    // Display OAuth / general auth errors
    React.useEffect(() => {
        if (errorParam === "OAuthAccountNotLinked") {
            toast({
                title: "Account Link Error",
                description: "To confirm your identity, sign in with the same account you used originally.",
                variant: "destructive",
            })
        } else if (errorParam) {
            toast({
                title: "Authentication Error",
                description: "There was a problem signing you in. Please try again.",
                variant: "destructive",
            })
        }
    }, [errorParam, toast])

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsLoading(true)
        try {
            const result = await signIn("email", { email, callbackUrl, redirect: false })
            if (result?.ok) {
                toast({
                    title: "Check your inbox",
                    description: "A magic link has been sent to your email address.",
                })
            } else if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-black" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white relative font-sans selection:bg-black selection:text-white overflow-hidden">

            {/* BACKGROUND: Cinematic Blurred Site Simulation */}
            <div className="absolute inset-0 z-0 overflow-hidden filter blur-[60px] scale-105 opacity-10 pointer-events-none select-none">
                <div className="max-w-7xl mx-auto px-12 py-20 space-y-32">
                    <header className="flex justify-between items-center border-b-[5px] border-black pb-12">
                        <div className="text-[140px] font-black tracking-[-0.08em] leading-none text-black uppercase">LUXECHO</div>
                    </header>
                </div>
            </div>

            {/* THE IDENTITY NODE (HORIZONTAL COMPACT POPUP) */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-6 backdrop-blur-[6px] bg-black/10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[800px] bg-white shadow-[0_100px_200px_-50px_rgba(0,0,0,0.4)] flex flex-col md:flex-row overflow-hidden relative rounded-2xl border border-gray-100 min-h-[500px]"
                >
                    {/* Left Wing: Branding (Black) */}
                    <div className="w-full md:w-[35%] bg-black p-10 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden shrink-0">
                        {/* Abstract Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />

                        <div className="relative z-10 space-y-6">
                            <div className="inline-block border-2 border-white px-6 py-2">
                                <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] leading-none">LUXECHO</h2>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] leading-relaxed">Identity <br /> Portal</p>
                                <div className="w-6 h-[2px] bg-white/20 mx-auto" />
                                <div className="flex justify-center text-white/30">
                                    <Lock className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Wing: Interactive Node (White) */}
                    <div className="w-full md:w-[65%] p-10 md:p-14 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-10"
                            >
                                <div className="border-b border-gray-100 pb-4 mb-2">
                                    <h1 className="text-xl font-black uppercase tracking-tight text-black leading-none">INITIALIZE SESSION</h1>
                                </div>

                                <div className="space-y-8">

                                    <form onSubmit={handleEmailSignIn} className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 block italic">SECURE EMAIL NODE</label>
                                            <div className="h-16 border-b-[3px] border-gray-100 focus-within:border-black transition-colors">
                                                <input
                                                    type="email"
                                                    placeholder="CLIENT@LUXECHO.COM"
                                                    className="w-full h-full px-6 bg-transparent text-sm font-black tracking-[0.1em] focus:outline-none uppercase placeholder:text-gray-200"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={isLoading} className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.4em] rounded-none shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SEND LINK"}
                                        </Button>
                                    </form>
                                </div>

                                <div className="space-y-6">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute inset-x-0 h-[2px] bg-gray-50" />
                                        <span className="relative bg-white px-6 text-[9px] font-black uppercase tracking-[0.5em] text-gray-700">OR SYNC VIA</span>
                                    </div>
                                    <button
                                        onClick={() => signIn("google", { callbackUrl })}
                                        className="w-full h-14 bg-white border-2 border-gray-100 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:border-black transition-all"
                                    >
                                        <Chrome className="w-4 h-4 text-gray-700" />
                                        GOOGLE SECURE SYNC
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Minimal Background Footer */}
            <div className="absolute bottom-10 inset-x-0 text-center z-0 opacity-20 select-none">
                <p className="text-[10px] font-black text-black uppercase tracking-[1em]">LUXECHO</p>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <React.Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-black" /></div>}>
            <SignInContent />
        </React.Suspense>
    )
}
