"use client"

import * as React from "react"
import { FileText, Shield, Truck, HelpCircle, Info, ArrowRight } from "lucide-react"

const POLICIES = [
  { label: "Terms & Conditions", href: "/terms", icon: FileText },
  { label: "Privacy Policy", href: "/privacy", icon: Shield },
  { label: "Return & Refund Policy", href: "#", icon: Truck },
  { label: "Shipping Policy", href: "#", icon: Truck },
  { label: "About Us", href: "/about", icon: Info },
  { label: "Help & Support", href: "#", icon: HelpCircle },
]

export function PoliciesSection() {
  return (
    <div className="border-b border-border pb-4 last:border-b-0">
      <h3 className="text-sm font-medium mb-3">Policies & Information</h3>
      <div className="space-y-2">
        {POLICIES.map((policy) => {
          const Icon = policy.icon
          return (
            <a
              key={policy.label}
              href={policy.href}
              className="flex items-center justify-between px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-neon-green" />
                <span>{policy.label}</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default PoliciesSection
