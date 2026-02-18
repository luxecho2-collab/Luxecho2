"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LuxechoLogo } from "./luxecho-logo"

export function LoadingScreen() {
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        // Only show premium intro once per session to maintain "ultra-fast" feel
        const hasShownIntro = sessionStorage.getItem("luxecho-intro-shown")

        if (hasShownIntro) {
            setIsLoading(false)
            return
        }

        const timer = setTimeout(() => {
            setIsLoading(false)
            sessionStorage.setItem("luxecho-intro-shown", "true")
        }, 800) // Slightly longer for the very first visit to feel premium

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        y: -20,
                        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
                >
                    <div className="relative">
                        <LuxechoLogo size={80} animate={true} />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mt-8 flex flex-col items-center"
                    >
                        <span className="text-sm font-black tracking-[0.6em] uppercase text-black">
                            Luxecho
                        </span>
                        <div className="mt-4 w-12 h-[1px] bg-black/10 overflow-hidden">
                            <motion.div
                                className="w-full h-full bg-black"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
