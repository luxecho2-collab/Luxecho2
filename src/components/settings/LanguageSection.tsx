"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { useSettings, type Language } from "@/contexts/settings-context"

const LANGUAGES: Array<{ code: Language; name: string; native: string; flag: string }> = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
]

export function LanguageSection() {
  const { language, setLanguage } = useSettings()

  return (
    <div className="border-b border-border pb-4 last:border-b-0">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-neon-green" />
        <label className="text-sm font-medium">Language & Region</label>
      </div>
      <div className="space-y-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
              language === lang.code
                ? "bg-neon-green text-black font-medium"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{lang.name}</div>
              <div className="text-xs opacity-75">{lang.native}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSection
