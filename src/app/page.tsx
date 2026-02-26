"use client"

import { FeaturedProducts } from "@/components/home/featured-products"
import { HeroSlideshow } from "@/components/home/hero-slideshow"
import { motion, useScroll, useTransform } from "framer-motion"
import NextImage from "next/image"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import "./brand.css"

/* ─── Data ─────────────────────────────────────────────────────────── */
const WAVES = [
  {
    id: "wave-01",
    num: "01",
    label: "001 / VARSITY",
    title: "VARSITY",
    sub: "POOLSIDE",
    accent: "DROP.",
    image: "/assets/images/brand/mens_emerald_varsity_poolside_1771586994342.png",
    align: "left" as const,
    desc: "Emerald canvas meets structured silhouette — worn by those who lead, never follow."
  },
  {
    id: "wave-02",
    num: "02",
    label: "002 / URBAN",
    title: "URBAN",
    sub: "LUXURY",
    accent: "EVOLVED.",
    image: "/assets/images/brand/womens_navy_varsity_rooftop_1771587018168.png",
    align: "right" as const,
    desc: "Navy precision. Rooftop aesthetic. Where architecture meets apparel."
  },
  {
    id: "wave-03",
    num: "03",
    label: "003 / UTILITY",
    title: "UTILITY",
    sub: "AESTHETIC",
    accent: "CORE.",
    image: "/assets/images/brand/mens_beige_utility_urban_1771587038435.png",
    align: "left" as const,
    desc: "Beige raw — the architecture of the streets translated into fabric and form."
  }
]

/* ─── Gender Split: Bonkerscorner-style 50/50 ───────────────────────── */
function GenderSplit() {
  const categories = [
    {
      label: "MEN",
      sub: "New Season.",
      href: "/products?gender=men",
      image: "/assets/images/brand/mens_category_editorial.png",
      align: "left" as const,
    },
    {
      label: "WOMEN",
      sub: "New Season.",
      href: "/products?gender=women",
      image: "/assets/images/brand/womens_category_editorial.png",
      align: "right" as const,
    },
  ]

  return (
    <section className="w-full flex flex-col md:flex-row min-h-[100vh] md:h-[90vh] bg-black overflow-hidden">
      {categories.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className="relative flex-1 group overflow-hidden cursor-none"
        >
          {/* Image */}
          <NextImage
            src={cat.image}
            alt={cat.label}
            fill
            className="object-cover object-top transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Divider line between panels (right panel only) */}
          {cat.align === "right" && (
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 z-10" />
          )}

          {/* Text */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-10 lg:p-16 z-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="block text-white/40 text-[9px] font-black uppercase tracking-[0.5em] mb-3">SS 2026</span>
            <h2 className="font-barlow font-black uppercase leading-[0.85] tracking-[-0.02em]">
              <span className="block text-white text-[18vw] md:text-[7vw] lg:text-[6rem] xl:text-[7rem]">{cat.label}</span>
              <span className="block text-white/20 text-[10vw] md:text-[4vw] lg:text-[3.5rem] xl:text-[4rem] italic">{cat.sub}</span>
            </h2>
            <span className="inline-flex items-center gap-3 mt-6 text-[9px] font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-colors duration-500">
              Shop Now
              <span className="w-6 h-px bg-white/40 group-hover:w-10 group-hover:bg-white transition-all duration-500" />
            </span>
          </motion.div>
        </Link>
      ))}
    </section>
  )
}


/* ─── Wave Section: 50/50 editorial split ───────────────────────────── */
function WaveSection({ wave }: { wave: typeof WAVES[0] }) {
  const ref = useRef(null)
  const imgRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])
  const isRight = wave.align === "right"

  return (
    <section
      ref={ref}
      className={`relative w-full min-h-screen md:h-screen flex flex-col bg-black overflow-hidden ${isRight ? "md:flex-row-reverse" : "md:flex-row"}`}
    >
      {/* ── Image Panel (100% mobile, 60% desktop) ── */}
      <div ref={imgRef} className="relative w-full md:w-[60%] h-[60vh] md:h-full overflow-hidden flex-shrink-0">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <NextImage
            src={wave.image}
            alt={wave.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority={wave.id === "wave-01"}
            unoptimized
          />
        </motion.div>
        {/* Subtle inner shadow toward the text side */}
        <div className={`absolute inset-0 ${isRight ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-transparent via-transparent to-black/70 pointer-events-none`} />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-8 right-8 text-[18vw] font-barlow font-black text-black/[0.04] leading-none pointer-events-none select-none">
          {wave.num}
        </div>
      </div>

      {/* ── Text Panel (100% mobile, 40% desktop) ── */}
      <div className={`relative w-full md:w-[40%] flex flex-col justify-center py-16 px-8 md:px-12 lg:px-20 z-10 bg-black ${isRight ? "md:items-end md:text-right" : "md:items-start md:text-left"}`}>
        {/* Vertical rule line */}
        <div className="absolute top-0 bottom-0 left-0 w-px bg-white/5" />

        <motion.div
          initial={{ opacity: 0, x: isRight ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className={`space-y-8 ${isRight ? "items-end text-right md:items-end md:text-right" : "items-start text-left md:items-start md:text-left"} flex flex-col`}
        >
          <span className="block text-rose-600 text-[9px] font-black uppercase tracking-[0.6em]">
            {wave.label}
          </span>

          <div>
            <h2 className="font-barlow font-black uppercase leading-[0.82] tracking-[-0.02em]">
              <span className="block text-white text-6xl lg:text-8xl xl:text-[7rem]">{wave.title}</span>
              <span className="block text-white/20 text-6xl lg:text-8xl xl:text-[7rem] italic">{wave.sub}</span>
              <span className="block text-rose-600 text-6xl lg:text-8xl xl:text-[7rem]">{wave.accent}</span>
            </h2>
          </div>

          <div className={`w-12 h-px bg-white/20 ${isRight ? "ml-auto" : ""}`} />

          <p className={`text-white/50 text-xs font-semibold uppercase tracking-[0.15em] leading-relaxed max-w-xs ${isRight ? "md:ml-auto" : ""}`}>
            {wave.desc}
          </p>

          <Link
            href="/products"
            className={`inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors group ${isRight ? "md:ml-auto" : ""}`}
          >
            Shop Now
            <span className="w-8 h-px bg-white/30 group-hover:w-12 group-hover:bg-white transition-all duration-500" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Marquee ──────────────────────────────────────────────────────── */
function Marquee() {
  const items = ["New Drop", "Varsity 001", "Urban Luxury", "Limited Edition", "Utility Core", "SS 2026", "Free Shipping"]
  const repeated = [...items, ...items, ...items]
  return (
    <div className="bg-rose-600 py-3.5 overflow-hidden whitespace-nowrap relative z-30">
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="flex gap-0 items-center"
      >
        {repeated.map((item, i) => (
          <span key={i} className="text-[9px] font-black uppercase tracking-[0.5em] text-white px-8">
            {item} <span className="opacity-50 pr-8">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}



/* ─── Final CTA ─────────────────────────────────────────────────────── */
function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  return (
    <section ref={ref} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <NextImage
          src="/assets/images/brand/womens_premium_streetwear_sunset_1771587061342.png"
          alt="Join the movement"
          fill
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-10"
        >
          <span className="block text-white/30 text-[9px] font-black uppercase tracking-[1em]">
            Join the Movement — Luxecho
          </span>
          <h2 className="font-barlow font-black uppercase leading-[0.85] tracking-tighter">
            <span className="block text-white text-6xl md:text-[10rem] lg:text-[12rem]">UNMASK</span>
            <span className="block text-6xl md:text-[10rem] lg:text-[12rem] text-transparent" style={{ WebkitTextStroke: "1px #e11d48" }}>THE FUTURE</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/products">
              <button className="px-14 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-2xl">
                Shop the Drop
              </button>
            </Link>
            <button className="px-14 py-6 bg-transparent border border-white/20 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:border-rose-600 hover:text-rose-600 transition-all duration-300">
              Join Community
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function Home() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <main className="bg-black min-h-screen cursor-none selection:bg-rose-600 selection:text-white overflow-x-hidden">
      {/* Custom Cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full mix-blend-difference bg-white hidden md:block"
        animate={{
          x: mousePos.x - (isHovering ? 20 : 6),
          y: mousePos.y - (isHovering ? 20 : 6),
          width: isHovering ? 40 : 12,
          height: isHovering ? 40 : 12,
        }}
        style={{
          display: 'var(--cursor-display, block)'
        }}
        transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.4 }}
      />

      {/* Sections */}
      <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <HeroSlideshow />
      </div>

      <Marquee />

      <GenderSplit />

      <FeaturedProducts limit={4} offset={0} hideHeader />

      {WAVES[0] && (
        <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <WaveSection wave={WAVES[0]} />
        </div>
      )}

      <FeaturedProducts limit={4} offset={4} hideHeader />

      {WAVES[1] && (
        <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <WaveSection wave={WAVES[1]} />
        </div>
      )}



      {WAVES[2] && (
        <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <WaveSection wave={WAVES[2]} />
        </div>
      )}

      <FeaturedProducts limit={4} offset={8} hideHeader />

      <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        <FinalCTA />
      </div>
    </main>
  )
}