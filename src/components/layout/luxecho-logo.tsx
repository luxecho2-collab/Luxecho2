"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LuxechoLogoProps {
    className?: string
    size?: number
    animate?: boolean
}

export function LuxechoLogo({ className, size = 32, animate = true }: LuxechoLogoProps) {
    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
        >
            {/* The "Echo" layers */}
            <AnimatePresence>
                {animate && [0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 border border-black/10 rounded-sm"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{
                            scale: 1 + i * 0.4,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Main Symbol - Geometric "L" with Echo detail */}
            <motion.svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: size, height: size }}
                className="relative z-10"
            >
                {/* Minimalist L */}
                <motion.path
                    d="M30 20V80H70"
                    stroke="black"
                    strokeWidth="12"
                    strokeLinecap="square"
                    initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Secondary "Echo" line */}
                <motion.path
                    d="M45 35V65H60"
                    stroke="black"
                    strokeWidth="4"
                    strokeLinecap="square"
                    initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.4 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                />
            </motion.svg>
        </div>
    )
}

import { AnimatePresence } from "framer-motion"
