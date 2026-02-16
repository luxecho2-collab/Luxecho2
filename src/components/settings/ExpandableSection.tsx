"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface ExpandableSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function ExpandableSection({ title, icon, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 hover:bg-muted/50 px-1 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-neon-green">{icon}</span>}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {isExpanded && <div className="pb-4 pl-6 space-y-3">{children}</div>}
    </div>
  )
}

export default ExpandableSection
