"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EyeOff } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="text-center space-y-12 max-w-lg">
                <div className="relative inline-block">
                    <h1 className="text-[12rem] font-black uppercase italic tracking-tighter leading-none text-white/5">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <EyeOff className="w-24 h-24 text-neon-green" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">DATA <span className="text-electric-pink">EXPUNGED</span></h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        The requested sector has been wiped from the neural grid or does not exist in this timeline.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto h-16 px-12 bg-white text-black font-black uppercase tracking-widest rounded-none shadow-[8px_8px_0px_#00FF41]">
                            Return to Base
                        </Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-none border-2 border-white text-white font-black uppercase tracking-widest">
                            Gear Archive
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
