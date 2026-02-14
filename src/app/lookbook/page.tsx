"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Expand, Info, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const slides = [
    {
        id: 1,
        title: "NEURAL CORE",
        tag: "COLLECTION 01",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000",
        description: "The synthesis of biological intent and mechanical precision. Optimized for high-density data environments.",
        color: "text-neon-green",
        bg: "bg-neon-green"
    },
    {
        id: 2,
        title: "STEALTH VOID",
        tag: "COLLECTION 02",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000",
        description: "Adaptive camouflage for the deep-grid operative. Silhouette disruption technology integrated as standard.",
        color: "text-cyber-blue",
        bg: "bg-cyber-blue"
    },
    {
        id: 3,
        title: "URBAN RADIANCE",
        tag: "COLLECTION 03",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2000",
        description: "Dominance in the high-frequency retail sectors. Visual saturation and aggressive aesthetic signatures.",
        color: "text-electric-pink",
        bg: "bg-electric-pink"
    }
]

export default function LookbookPage() {
    const [currentSlide, setCurrentSlide] = React.useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = React.useState(true)

    React.useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [isAutoPlaying])

    const next = () => {
        setIsAutoPlaying(false)
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    const prev = () => {
        setIsAutoPlaying(false)
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-neon-green selection:text-black">
            {/* Immersive Background */}
            <div className="fixed inset-0 z-0">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                            index === currentSlide ? "opacity-40 scale-100" : "opacity-0 scale-110"
                        )}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 min-h-screen flex flex-col justify-between p-6 md:p-12 lg:p-24 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neon-green">Protocol V1.0 - Lookbook</p>
                        <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none group">
                            CYBER <span className="text-neon-green">ZEN</span><br />
                            ARCHIVE
                        </h1>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <Button variant="outline" size="icon" className="rounded-none border-white/20 bg-black/50 hover:bg-neon-green hover:text-black">
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-none border-white/20 bg-black/50 hover:bg-neon-green hover:text-black">
                            <Expand className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Main Slide Content */}
                <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className={cn("w-12 h-0.5", slides[currentSlide].bg)} />
                            <p className={cn("text-xs font-black uppercase tracking-[0.5em]", slides[currentSlide].color)}>
                                {slides[currentSlide].tag}
                            </p>
                        </div>
                        <h2 className="text-7xl md:text-[12rem] font-black uppercase italic tracking-tighter leading-[0.7] md:-ml-2">
                            {slides[currentSlide].title.split(' ')[0]}<br />
                            <span className={cn("inline-block", slides[currentSlide].color)}>
                                {slides[currentSlide].title.split(' ')[1]}
                            </span>
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
                        <div className="max-w-md space-y-8">
                            <p className="text-sm md:text-xl font-bold uppercase tracking-widest leading-relaxed text-white/60 italic">
                                "{slides[currentSlide].description}"
                            </p>
                            <Button className="h-16 px-12 bg-white text-black font-black uppercase tracking-widest rounded-none shadow-[8px_8px_0px_#00FF41] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                Acquire Data
                            </Button>
                        </div>

                        {/* Slide Selector */}
                        <div className="flex gap-4 p-4 bg-black/50 backdrop-blur-xl border-2 border-white/10">
                            <Button onClick={prev} variant="ghost" className="h-12 w-12 p-0 text-white hover:text-neon-green rounded-none">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                            <div className="flex items-center gap-4 px-8 border-x-2 border-white/10 font-black italic">
                                <span className="text-neon-green">0{currentSlide + 1}</span>
                                <span className="text-white/20">/</span>
                                <span className="text-white">0{slides.length}</span>
                            </div>
                            <Button onClick={next} variant="ghost" className="h-12 w-12 p-0 text-white hover:text-neon-green rounded-none">
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Vertical Text */}
                <div className="absolute right-12 top-1/2 -rotate-90 origin-right hidden lg:block">
                    <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20 whitespace-nowrap">
                        NEURAL INTERFACE OPTIMIZED // ZENZ SYSTEMS 2077
                    </p>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex h-1 gap-1">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className="flex-grow bg-white/10 transition-all duration-300"
                    >
                        <div
                            className={cn(
                                "h-full bg-neon-green transition-all duration-300",
                                index === currentSlide ? "w-full" : "w-0"
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
