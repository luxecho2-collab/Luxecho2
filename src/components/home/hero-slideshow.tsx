"use client"

import { api } from "@/trpc/react"
import { motion, AnimatePresence } from "framer-motion"
import NextImage from "next/image"
import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

/* ── fallback slides if DB is empty ───────────────────────────────── */
const FALLBACK_SLIDES = [
    {
        id: "fallback-1",
        title: "DEFINING LUXURY",
        subtitle: "New Collection — SS2026",
        ctaText: "Explore Drop",
        ctaLink: "/products",
        image: "/assets/images/brand/hero_cinematic_background_v2_1771587109566.png",
        slideStyle: "01",
    },
    {
        id: "fallback-2",
        title: "ELEVATED BASICS",
        subtitle: "Essentials Worth Repeating",
        ctaText: "Shop Now",
        ctaLink: "/products",
        image: "/assets/images/brand/womens_premium_streetwear_sunset_1771587061342.png",
        slideStyle: "02",
    },
    {
        id: "fallback-3",
        title: "VARSITY EDIT",
        subtitle: "Collection 001 — Poolside",
        ctaText: "View Collection",
        ctaLink: "/products",
        image: "/assets/images/brand/mens_emerald_varsity_poolside_1771586994342.png",
        slideStyle: "03",
    },
]

const SLIDE_DURATION = 8000 // ms

// ─── TEMPLATE HELPER ──────────────────────────────────────────────────

function TemplateBackground({ image, title, blur = 0, opacity = 0.5 }: { image: string, title: string, blur?: number, opacity?: number }) {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <NextImage
                src={image}
                alt={title}
                fill
                className="object-cover object-center transition-all duration-1000"
                style={{
                    filter: `blur(${blur}px)`,
                }}
                priority
                unoptimized
            />
            {/* The Black Overlay (Darkness Control) is NOW ON TOP of the image */}
            <div
                className="absolute inset-0 z-[1] bg-black transition-opacity duration-1000"
                style={{ opacity }}
            />
            {/* Subtle gradient overlay to ensure text contrast */}
            <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        </div>
    )
}

// ─── THE SIGNATURE CINEMATIC ─────────────────────
function SignatureTemplate({ slide }: { slide: any }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden">
            <TemplateBackground
                image={slide.image}
                title={slide.title}
                blur={slide.backgroundBlur}
                opacity={slide.backgroundOpacity}
            />

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                {/* Brand Label Accent */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6"
                >

                </motion.div>

                {/* Main Heading with Layered Styling */}
                <div className="relative mb-16">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="m-0 text-[clamp(60px,12vw,160px)] font-black text-white uppercase leading-[0.8] tracking-[-0.04em] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        {slide.title}
                    </motion.h2>

                    {/* Decorative Accents (Graphic Feel) */}
                    <div className="absolute -inset-4 pointer-events-none select-none opacity-60">
                        {/* We can use CSS-based "strokes" or simple colored lines to mimic the drawing feel */}
                        <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-yellow-400 to-transparent rotate-12 blur-[1px]" />
                        <div className="absolute bottom-4 left-0 w-40 h-1.5 bg-gradient-to-r from-red-500 to-transparent -rotate-6 blur-[1px]" />
                        <div className="absolute top-1/2 -right-8 w-24 h-2 bg-gradient-to-t from-blue-400 to-transparent rotate-45 blur-[1px]" />
                    </div>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <Link href={slide.ctaLink}>
                        <button className="bg-white text-black px-16 py-5 rounded-xl text-[clamp(14px,1.2vw,18px)] font-bold tracking-tight hover:bg-black hover:text-white transition-all duration-500 shadow-2xl">
                            {slide.ctaText}
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

// ─── T02: LEFT-ALIGNED EDITORIAL ──────────────────────────────
function EditorialTemplate({ slide }: { slide: any }) {
    return (
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-24 text-left overflow-hidden">
            <TemplateBackground
                image={slide.image}
                title={slide.title}
                blur={slide.backgroundBlur}
                opacity={slide.backgroundOpacity}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pr-0 md:pr-48">
                {/* Brand Accent */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 flex items-center gap-4"
                >
                    <div className="w-12 h-[2px] bg-white/80" />
                    <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.4em] drop-shadow-lg">
                        LUXECHO EDITORIAL
                    </p>
                </motion.div>

                {/* Main Heading */}
                <motion.h2
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="m-0 mb-6 text-[clamp(50px,8vw,120px)] font-black text-white uppercase leading-[0.9] tracking-tighter drop-shadow-2xl"
                >
                    {slide.title}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="text-white/80 text-lg md:text-2xl font-light tracking-wide mb-12 max-w-2xl"
                >
                    {slide.subtitle}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <Link href={slide.ctaLink}>
                        <button className="bg-transparent border border-white text-white px-12 py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm">
                            {slide.ctaText}
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

// ─── T03: MINIMALIST FILM ─────────────────────────────────────
function MinimalistTemplate({ slide }: { slide: any }) {
    return (
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 text-center overflow-hidden">
            <TemplateBackground
                image={slide.image}
                title={slide.title}
                blur={slide.backgroundBlur}
                opacity={slide.backgroundOpacity}
            />

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center bg-black/40 backdrop-blur-md p-6 md:p-12 border border-white/10 shadow-2xl rounded-sm">

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="m-0 mb-4 text-[clamp(30px,5vw,72px)] font-serif text-white uppercase leading-tight tracking-tight drop-shadow-lg"
                >
                    {slide.title}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-white/70 text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-8"
                >
                    {slide.subtitle}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <Link href={slide.ctaLink}>
                        <button className="text-white border-b-2 border-white/30 pb-1 text-xs md:text-sm font-black tracking-widest uppercase hover:border-white transition-all duration-300">
                            {slide.ctaText}
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
// ─── T04: AVANT-GARDE RIGHT ─────────────────────────────────────
function AvantGardeTemplate({ slide }: { slide: any }) {
    return (
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-24 text-right overflow-hidden">
            <TemplateBackground
                image={slide.image}
                title={slide.title}
                blur={slide.backgroundBlur}
                opacity={slide.backgroundOpacity}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-end pl-0 md:pl-48">
                {/* Brand Accent */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 flex items-center justify-end gap-4"
                >
                    <p className="text-white text-xs md:text-sm font-black uppercase tracking-[0.6em] drop-shadow-lg">
                        LUXECHO AVANT-GARDE
                    </p>
                    <div className="w-16 h-[1px] bg-white/60" />
                </motion.div>

                {/* Main Heading - Staggered Lines */}
                <div className="flex flex-col items-end gap-2 mb-8">
                    {slide.title.split(' ').map((word: string, i: number) => (
                        <motion.h2
                            key={i}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="m-0 text-[clamp(40px,7vw,110px)] font-black text-white leading-[0.85] tracking-tight drop-shadow-2xl italic pr-4"
                            style={{ paddingRight: `${i * 2}rem` }}
                        >
                            {word}
                        </motion.h2>
                    ))}
                </div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="text-white/90 text-sm md:text-lg font-normal tracking-[0.2em] uppercase mb-12 max-w-lg border-r-2 border-white/50 pr-4"
                >
                    {slide.subtitle}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    <Link href={slide.ctaLink}>
                        <button className="bg-white text-black px-10 py-4 text-xs font-black tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all duration-500 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            {slide.ctaText}
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

// ─── T05: BOUTIQUE FRAME ──────────────────────────────────────
function BoutiqueFrameTemplate({ slide }: { slide: any }) {
    return (
        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12 overflow-hidden">
            <TemplateBackground
                image={slide.image}
                title={slide.title}
                blur={slide.backgroundBlur}
                opacity={slide.backgroundOpacity}
            />

            {/* The Frame */}
            <div className="relative z-10 w-full h-full border-[1px] md:border-[2px] border-white/30 flex flex-col items-center justify-center p-8 transition-all duration-1000 group">

                {/* Micro branding in frame */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-white/60 uppercase tracking-[0.5em] font-medium">
                    L U X E C H O
                </div>

                <div className="flex flex-col items-center gap-12 max-w-3xl text-center">
                    {/* Main Heading */}
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="m-0 text-[clamp(28px,4vw,60px)] font-light text-white uppercase leading-tight tracking-[0.4em] drop-shadow-md"
                    >
                        {slide.title}
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-white/70 text-xs md:text-sm font-light tracking-[0.3em] uppercase"
                    >
                        {slide.subtitle}
                    </motion.p>
                </div>

                {/* CTA Button */}
                <motion.div
                    className="absolute bottom-16 lg:bottom-24"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    <Link href={slide.ctaLink}>
                        <button className="text-white text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase hover:tracking-[0.6em] transition-all duration-700 ease-out border-b border-white/40 hover:border-white pb-2 flex items-center gap-4">
                            <span>{slide.ctaText}</span>
                            <span className="text-white/50 text-base font-light">→</span>
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

const TEMPLATE_MAP: Record<string, React.FC<{ slide: any }>> = {
    "01": SignatureTemplate,
    "02": EditorialTemplate,
    "03": MinimalistTemplate,
    "04": AvantGardeTemplate,
    "05": BoutiqueFrameTemplate,
}
export function HeroSlideshow() {
    const { data: dbSlides } = api.cms.getActiveSlides.useQuery()
    const slides = dbSlides && dbSlides.length > 0 ? dbSlides : FALLBACK_SLIDES

    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
    const [hovered, setHovered] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const next = () => {
        setDirection(1)
        setCurrent((prev) => (prev + 1) % slides.length)
    }

    const prev = () => {
        setDirection(-1)
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const goTo = (idx: number) => {
        setDirection(idx > current ? 1 : -1)
        setCurrent(idx)
    }

    useEffect(() => {
        if (hovered || slides.length <= 1) return
        intervalRef.current = setTimeout(next, SLIDE_DURATION)
        return () => { if (intervalRef.current) clearTimeout(intervalRef.current) }
    }, [current, hovered, slides.length])

    const slide = slides[current]!
    const activeStyle = (slide as any).slideStyle || "01"
    const Template = TEMPLATE_MAP[activeStyle] || SignatureTemplate

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 1 }),
        center: { x: "0%", opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 1 }),
    }

    return (
        <section
            className="relative h-screen w-full overflow-hidden bg-black"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                <motion.div
                    key={slide.id}
                    custom={direction}
                    variants={slides.length > 1 ? slideVariants : {}}
                    initial={slides.length > 1 ? "enter" : "center"}
                    animate="center"
                    exit={slides.length > 1 ? "exit" : "center"}
                    transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Template slide={slide} />
                </motion.div>
            </AnimatePresence>

            {/* ── Slide navigation arrows */}
            {slides.length > 1 && (

                <div className="absolute right-6 bottom-6 md:right-12 md:bottom-12 z-30 flex gap-2 md:gap-4">
                    <button
                        onClick={prev}
                        className="w-10 h-10 md:w-14 md:h-14 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={next}
                        className="w-10 h-10 md:w-14 md:h-14 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-md"
                    >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            )}

            {/* ── Slide dots & Progress */}
            {slides.length > 1 && (
                <div className="absolute left-6 bottom-6 md:left-12 md:bottom-12 flex flex-col gap-4 md:gap-6 z-30">
                    <div className="scale-75 md:scale-100 origin-left">
                        <p className="text-white text-base md:text-xl font-black uppercase tracking-[0.4em] mb-2 md:mb-6 drop-shadow-lg">
                            LUXECHO®
                        </p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        {slides.map((_: unknown, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`group relative h-1 transition-all duration-500 ${idx === current ? "w-10 md:w-16 bg-white" : "w-6 md:w-8 bg-white/20 hover:bg-white/40"}`}
                            >
                                <span className={`absolute -top-4 left-0 text-[8px] font-black transition-opacity duration-500 ${idx === current ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                    0{idx + 1}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
