"use client"

import * as React from "react"
import { Settings } from "lucide-react"

export function SettingsMenuItem({ onClick }: { onClick?: () => void }) {
    const handleClick = React.useCallback(() => {
        console.log("Settings clicked")
        onClick?.()
    }, [onClick])

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center gap-3 hover:bg-neon-green hover:text-black cursor-pointer uppercase text-xs font-bold tracking-widest p-2"
        >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
        </button>
    )
}

export default SettingsMenuItem
