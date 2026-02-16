"use client"

import * as React from "react"
import { Bell, Mail, MessageSquare, Sparkles, Bookmark } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import SettingsToggle from "./SettingsToggle"
import ExpandableSection from "./ExpandableSection"

export function NotificationSection() {
  const { notificationPreferences, setNotificationPreferences, recommendationsEnabled, setRecommendationsEnabled, autoSaveCart, setAutoSaveCart } = useSettings()

  const handleNotificationChange = (key: keyof typeof notificationPreferences, value: boolean) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4 border-b border-border pb-4 last:border-b-0">
      {/* Email Notifications */}
      <ExpandableSection
        title="Email Notifications"
        icon={<Mail className="w-4 h-4" />}
        defaultExpanded={true}
      >
        <div className="space-y-3">
          {[
            { key: "emailOrders", label: "Order Confirmations" },
            { key: "emailShipping", label: "Shipping Updates" },
            { key: "emailPromo", label: "Promotional Emails" },
            { key: "emailRestock", label: "Restock Alerts" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="text-sm">{item.label}</label>
              <SettingsToggle
                checked={notificationPreferences[item.key as keyof typeof notificationPreferences]}
                onChange={(checked) => handleNotificationChange(item.key as keyof typeof notificationPreferences, checked)}
              />
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* SMS Notifications */}
      <ExpandableSection
        title="SMS Notifications"
        icon={<MessageSquare className="w-4 h-4" />}
      >
        <div className="space-y-3">
          {[
            { key: "smsOrders", label: "Order Confirmations" },
            { key: "smsShipping", label: "Shipping Updates" },
            { key: "smsPromo", label: "Promotional SMS" },
            { key: "smsRestock", label: "Restock Alerts" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="text-sm">{item.label}</label>
              <SettingsToggle
                checked={notificationPreferences[item.key as keyof typeof notificationPreferences]}
                onChange={(checked) => handleNotificationChange(item.key as keyof typeof notificationPreferences, checked)}
              />
            </div>
          ))}
        </div>
      </ExpandableSection>

      {/* Product Recommendations */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Product Recommendations</label>
        </div>
        <SettingsToggle
          checked={recommendationsEnabled}
          onChange={setRecommendationsEnabled}
        />
      </div>
      {recommendationsEnabled && (
        <p className="text-xs text-muted-foreground pl-6">Based on your browsing history and purchases</p>
      )}

      {/* Auto-Save Cart */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Save Cart Items</label>
        </div>
        <SettingsToggle
          checked={autoSaveCart}
          onChange={setAutoSaveCart}
        />
      </div>
      {autoSaveCart && (
        <p className="text-xs text-muted-foreground pl-6">Cart items will be saved for 30 days</p>
      )}
    </div>
  )
}

export default NotificationSection
