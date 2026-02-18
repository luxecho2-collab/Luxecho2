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

interface AuthPortalProps {
    callbackUrl?: string;
    isPopup?: boolean;
}

export function AuthPortal({ callbackUrl, isPopup = true }: AuthPortalProps) {
    const { status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const effectiveCallbackUrl = callbackUrl || searchParams.get("callbackUrl") || "/admin"

    const [mode, setMode] = React.useState<"email" | "phone">("phone")
    const [email, setEmail] = React.useState("")
    const [phoneNumber, setPhoneNumber] = React.useState("")
    const [otp, setOtp] = React.useState("")
    const [otpSent, setOtpSent] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setIsLoading(true)
        try {
            await signIn("email", { email, callbackUrl: effectiveCallbackUrl, redirect: false })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (phoneNumber.length < 10) return
        setIsLoading(true)
        setTimeout(() => {
            setOtpSent(true)
            setIsLoading(false)
        }, 800)
    }

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length < 6) return
        setIsLoading(true)
        try {
            const result = await signIn("phone", {
                phone: phoneNumber,
                otp: otp,
                callbackUrl: effectiveCallbackUrl,
                redirect: false
            })
            if (result?.ok) {
                if (isPopup) {
                    window.location.reload(); // Refresh to update session state in the current page context
                } else {
                    router.push(effectiveCallbackUrl)
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget && isPopup) {
                    router.back()
                }
            }}
            className={cn(
                "relative font-sans selection:bg-black selection:text-white",
                !isPopup ? "min-h-screen bg-white" : "fixed inset-0 z-[100] flex items-start justify-center p-6 pt-20 md:pt-32 backdrop-blur-[12px] bg-black/5"
            )}
        >

            {/* BACKGROUND: Cinematic Blurred Site Simulation (Only if not a real popup over existing content) */}
            {!isPopup && (
                <div className="absolute inset-0 z-0 overflow-hidden filter blur-[60px] scale-105 opacity-10 pointer-events-none select-none">
                    <div className="max-w-7xl mx-auto px-12 py-20 space-y-32">
                        <header className="flex justify-between items-center border-b-[5px] border-black pb-12">
                            <div className="text-[140px] font-black tracking-[-0.08em] leading-none text-black uppercase">LUXECHO</div>
                        </header>
                    </div>
                </div>
            )}

            {/* THE IDENTITY NODE (HORIZONTAL COMPACT POPUP) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[800px] bg-white shadow-[0_100px_200px_-50px_rgba(0,0,0,0.4)] flex flex-col md:flex-row overflow-hidden relative rounded-2xl border border-gray-100 min-h-[500px] z-10"
            >
                {/* Left Wing: Branding (Black) */}
                <div className="w-full md:w-[35%] bg-black p-10 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden shrink-0">
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
                <div className="w-full md:w-[65%] p-10 md:p-14 flex flex-col justify-center bg-white">
                    <AnimatePresence mode="wait">
                        {otpSent ? (
                            <motion.form
                                key="verify"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                onSubmit={handleOtpVerify}
                                className="space-y-10"
                            >
                                <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-700 hover:text-black transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    BACK
                                </button>

                                <div className="space-y-4">
                                    <h1 className="text-4xl font-black uppercase tracking-tighter text-black">THE CYPHER</h1>
                                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-relaxed">
                                        SENT TO <span className="text-black">{phoneNumber}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="flex-1 h-14 bg-gray-50 border-b-[3px] border-gray-100 focus-within:border-black transition-all flex items-center justify-center">
                                            <input
                                                autoFocus={i === 0}
                                                maxLength={1}
                                                className="w-full h-full bg-transparent text-center text-2xl font-black focus:outline-none"
                                                value={otp[i] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val && otp.length < 6) setOtp(prev => prev + val)
                                                    if (!val) setOtp(prev => prev.slice(0, -1))
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.4em] rounded-none hover:bg-neutral-900 transition-all shadow-[10px_10px_0px_rgba(0,0,0,0.05)]"
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "VERIFY"}
                                </Button>
                            </motion.form>
                        ) : (
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
                                    {/* Protocol Toggle */}
                                    <div className="flex bg-gray-50 p-2 rounded-none relative">
                                        <motion.div
                                            animate={{ x: mode === "phone" ? 0 : "100%" }}
                                            transition={{ type: "spring", damping: 30, stiffness: 250 }}
                                            className="absolute inset-y-2 left-2 w-[calc(50%-4px)] bg-white shadow-sm z-0"
                                        />
                                        <button onClick={() => setMode("phone")} className={cn("relative z-10 flex-1 h-10 text-[9px] font-black uppercase tracking-widest transition-colors", mode === "phone" ? "text-black" : "text-gray-400")}>PHONE</button>
                                        <button onClick={() => setMode("email")} className={cn("relative z-10 flex-1 h-10 text-[9px] font-black uppercase tracking-widest transition-colors", mode === "email" ? "text-black" : "text-gray-400")}>EMAIL</button>
                                    </div>

                                    {mode === "phone" ? (
                                        <form onSubmit={handlePhoneSubmit} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 block italic">MOBILE ACCESS NODE</label>
                                                <div className="flex h-16 border-b-[3px] border-gray-100 focus-within:border-black transition-colors group">
                                                    <div className="flex items-center px-6 bg-gray-50 group-focus-within:bg-black group-focus-within:text-white transition-colors">
                                                        <span className="text-sm font-black tracking-tighter">+91</span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        placeholder="NUMBER"
                                                        className="flex-1 px-6 bg-transparent text-sm font-black tracking-[0.2em] focus:outline-none placeholder:text-gray-200 text-black"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" disabled={isLoading} className="w-full h-16 bg-black text-white font-black uppercase tracking-[0.4em] rounded-none group hover:bg-black transition-all shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
                                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <div className="flex items-center gap-3">
                                                        INITIALIZE
                                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleEmailSignIn} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 block italic">SECURE EMAIL NODE</label>
                                                <div className="h-16 border-b-[3px] border-gray-100 focus-within:border-black transition-colors">
                                                    <input
                                                        type="email"
                                                        placeholder="CLIENT@LUXECHO.COM"
                                                        className="w-full h-full px-6 bg-transparent text-sm font-black tracking-[0.1em] focus:outline-none uppercase placeholder:text-gray-200 text-black"
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
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute inset-x-0 h-[2px] bg-gray-50" />
                                        <span className="relative bg-white px-6 text-[9px] font-black uppercase tracking-[0.5em] text-gray-700">OR SYNC VIA</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => signIn("google", { callbackUrl: effectiveCallbackUrl })}
                                        className="w-full h-14 bg-white border-2 border-gray-100 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-black hover:border-black transition-all"
                                    >
                                        <Chrome className="w-4 h-4 text-gray-700" />
                                        GOOGLE SECURE SYNC
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Minimal Background Decoration for full-page mode */}
            {!isPopup && (
                <div className="absolute bottom-10 inset-x-0 text-center z-0 opacity-20 select-none">
                    <p className="text-[10px] font-black text-black uppercase tracking-[1em]">LUXECHO</p>
                </div>
            )}
        </div>
    )
}
