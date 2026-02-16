"use client"

import * as React from "react"
import { Settings, X } from "lucide-react"
import AppearanceSection from "@/components/settings/AppearanceSection"
import LanguageSection from "@/components/settings/LanguageSection"
import NotificationSection from "@/components/settings/NotificationSection"
import PaymentSection from "@/components/settings/PaymentSection"
import PoliciesSection from "@/components/settings/PoliciesSection"

export default function FloatingSettings() {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* Settings Button */}
      <button
        aria-label="Open settings"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-neon-green text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-[80vh] bg-card border border-border rounded-lg shadow-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
            <h2 className="font-bold text-lg">Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Appearance & Display Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Appearance & Display</h3>
              <AppearanceSection />
            </div>

            {/* Language & Region Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Language & Region</h3>
              <LanguageSection />
            </div>

            {/* Notifications & Preferences Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Notifications & Preferences</h3>
              <NotificationSection />
            </div>

            {/* Payment & Security Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Payment & Security</h3>
              <PaymentSection />
            </div>

            {/* Policies & Information Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Policies & Information</h3>
              <PoliciesSection />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
