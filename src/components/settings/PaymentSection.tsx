"use client"

import * as React from "react"
import { CreditCard, Shield, X, Plus, Trash2 } from "lucide-react"
import { useSettings, type SavedCard } from "@/contexts/settings-context"
import SettingsToggle from "./SettingsToggle"

export function PaymentSection() {
  const { savedCards, setSavedCards, twoFactorEnabled, setTwoFactorEnabled } = useSettings()
  const [showModal, setShowModal] = React.useState(false)

  const removeCard = (id: string) => {
    const updated = savedCards.filter((card) => card.id !== id)
    setSavedCards(updated)
  }

  const addCard = () => {
    const newCard: SavedCard = {
      id: Date.now().toString(),
      last4: Math.floor(Math.random() * 9000 + 1000).toString(),
      brand: ["Visa", "Mastercard", "Amex"][Math.floor(Math.random() * 3)],
      isDefault: false,
    }
    setSavedCards([...savedCards, newCard])
  }

  return (
    <div className="space-y-4 border-b border-border pb-4 last:border-b-0">
      {/* Payment Methods */}
      <div>
        <button
          onClick={() => setShowModal(!showModal)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors"
        >
          <CreditCard className="w-4 h-4 text-neon-green" />
          Manage Payment Methods
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-card border border-border rounded-lg max-w-sm w-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Saved Cards</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {savedCards.map((card) => (
                  <div key={card.id} className="p-3 bg-muted rounded flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{card.brand}</div>
                      <div className="text-xs text-muted-foreground">**** **** **** {card.last4}</div>
                      {card.isDefault && <div className="text-xs text-neon-green font-medium mt-1">Default</div>}
                    </div>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCard}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neon-green text-black font-medium rounded hover:bg-neon-green/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Card
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-green" />
          <label className="text-sm font-medium">Two-Factor Authentication</label>
        </div>
        <SettingsToggle
          checked={twoFactorEnabled}
          onChange={setTwoFactorEnabled}
        />
      </div>
      {twoFactorEnabled ? (
        <div className="pl-6 space-y-2">
          <p className="text-xs text-muted-foreground">2FA is active via SMS/Email</p>
          <button className="text-xs text-neon-green hover:underline font-medium">
            Setup 2FA
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground pl-6">Enable 2FA for extra security</p>
      )}
    </div>
  )
}

export default PaymentSection
