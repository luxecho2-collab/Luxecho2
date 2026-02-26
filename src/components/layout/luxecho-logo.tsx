"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LuxechoLogoProps {
    className?: string
    size?: number
    animate?: boolean
}

import Image from "next/image"

export function LuxechoLogo({ className, size = 32, animate = true }: LuxechoLogoProps) {
    return (
        <motion.div
            className={cn("relative flex items-center justify-center", className)}
            initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <Image
                src="/logo.png"
                alt="Luxecho Logo"
                width={size}
                height={size}
                className="object-contain"
                priority
            />
        </motion.div>
    )
}

import { AnimatePresence } from "framer-motion"
