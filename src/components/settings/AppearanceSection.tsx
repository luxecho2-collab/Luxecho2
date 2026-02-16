"use client"

import * as React from "react"
import { Sun, Type, Grid3x3, BarChart3, Zap, ZapOff } from "lucide-react"
import { useSettings, type Theme, type FontSize, type GridView } from "@/contexts/settings-context"
import SettingsToggle from "./SettingsToggle"

export function AppearanceSection() {
  const { theme, fontSize, gridView, animationsEnabled, setTheme, setFontSize, setGridView, setAnimationsEnabled } = useSettings()

  return (
    <div className="space-y-4 border-b border-border pb-4 last:border-b-0">
      {/* Animations Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {animationsEnabled ? (
            <Zap className="w-4 h-4 text-neon-green" />
          ) : (
            <ZapOff className="w-4 h-4 text-muted-foreground" />
          )}
          <label className="text-sm font-medium">Animations</label>
        </div>
        <SettingsToggle
          checked={animationsEnabled}
          onChange={setAnimationsEnabled}
        />
      </div>

      {/* Theme Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Theme</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "system", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors capitalize ${
                theme === t
                  ? "bg-neon-green text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t === "system" ? "Auto" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Type className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Font Size</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors capitalize ${
                fontSize === size
                  ? "bg-neon-green text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {size === "small" ? "S" : size === "medium" ? "M" : "L"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Current size: {fontSize}</p>
      </div>

      {/* Grid View Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Grid3x3 className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Product Display</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["grid", "list"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setGridView(view)}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors capitalize flex items-center justify-center gap-1 ${
                gridView === view
                  ? "bg-neon-green text-black"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {view === "grid" ? (
                <>
                  <Grid3x3 className="w-3 h-3" />
                  Grid
                </>
              ) : (
                <>
                  <BarChart3 className="w-3 h-3" />
                  List
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppearanceSection
