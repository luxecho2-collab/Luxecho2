"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LuxechoLogoProps {
    className?: string
    size?: number
    animate?: boolean
}

import Image from "next/image"

export function LuxechoLogo({ className, size = 42, animate = true }: LuxechoLogoProps) {
    return (
        <motion.div
            className={cn("relative flex items-center justify-center", className)}
            initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <Image
                src="/Logo3.png"
                alt="Luxecho Logo"
                width={42}
                height={42}
                className="object-contain"
                priority
            />
        </motion.div>
    )
}

import { AnimatePresence } from "framer-motion"
