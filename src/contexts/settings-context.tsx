"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"
export type FontSize = "small" | "medium" | "large"
export type GridView = "grid" | "list"
export type Language = "en" | "es" | "fr" | "de" | "hi" | "ja"

export interface NotificationPreferences {
  emailOrders: boolean
  emailShipping: boolean
  emailPromo: boolean
  emailRestock: boolean
  smsOrders: boolean
  smsShipping: boolean
  smsPromo: boolean
  smsRestock: boolean
}

export interface SavedCard {
  id: string
  last4: string
  brand: string
  isDefault: boolean
}

export interface SettingsContextType {
  // Appearance & Display
  theme: Theme
  fontSize: FontSize
  gridView: GridView
  animationsEnabled: boolean
  
  // Language & Region
  language: Language
  
  // Notifications & Preferences
  notificationPreferences: NotificationPreferences
  recommendationsEnabled: boolean
  autoSaveCart: boolean
  
  // Payment & Security
  savedCards: SavedCard[]
  twoFactorEnabled: boolean
  
  // Setters
  setTheme: (theme: Theme) => void
  setFontSize: (size: FontSize) => void
  setGridView: (view: GridView) => void
  setAnimationsEnabled: (enabled: boolean) => void
  setLanguage: (language: Language) => void
  setNotificationPreferences: (prefs: NotificationPreferences) => void
  setRecommendationsEnabled: (enabled: boolean) => void
  setAutoSaveCart: (enabled: boolean) => void
  setSavedCards: (cards: SavedCard[]) => void
  setTwoFactorEnabled: (enabled: boolean) => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  emailOrders: true,
  emailShipping: true,
  emailPromo: false,
  emailRestock: true,
  smsOrders: true,
  smsShipping: false,
  smsPromo: false,
  smsRestock: false,
}

const DEFAULT_CARDS: SavedCard[] = [
  { id: "1", last4: "1234", brand: "Visa", isDefault: true },
]

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system")
  const [fontSize, setFontSizeState] = React.useState<FontSize>("medium")
  const [gridView, setGridViewState] = React.useState<GridView>("grid")
  const [animationsEnabled, setAnimationsEnabledState] = React.useState(true)
  const [language, setLanguageState] = React.useState<Language>("en")
  const [notificationPreferences, setNotificationPreferencesState] = React.useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS)
  const [recommendationsEnabled, setRecommendationsEnabledState] = React.useState(true)
  const [autoSaveCart, setAutoSaveCartState] = React.useState(true)
  const [savedCards, setSavedCardsState] = React.useState<SavedCard[]>(DEFAULT_CARDS)
  const [twoFactorEnabled, setTwoFactorEnabledState] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  // Load from localStorage on mount
  React.useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem("funkystore_settings")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.theme) setThemeState(parsed.theme)
        if (parsed.fontSize) setFontSizeState(parsed.fontSize)
        if (parsed.gridView) setGridViewState(parsed.gridView)
        if (parsed.animationsEnabled !== undefined) setAnimationsEnabledState(parsed.animationsEnabled)
        if (parsed.language) setLanguageState(parsed.language)
        if (parsed.notificationPreferences) setNotificationPreferencesState(parsed.notificationPreferences)
        if (parsed.recommendationsEnabled !== undefined) setRecommendationsEnabledState(parsed.recommendationsEnabled)
        if (parsed.autoSaveCart !== undefined) setAutoSaveCartState(parsed.autoSaveCart)
        if (parsed.savedCards) setSavedCardsState(parsed.savedCards)
        if (parsed.twoFactorEnabled !== undefined) setTwoFactorEnabledState(parsed.twoFactorEnabled)
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    }
  }, [])

  // Apply theme
  React.useEffect(() => {
    if (!isMounted) return

    const htmlElement = document.documentElement
    
    if (theme === "dark") {
      htmlElement.classList.add("dark")
    } else if (theme === "light") {
      htmlElement.classList.remove("dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        htmlElement.classList.add("dark")
      } else {
        htmlElement.classList.remove("dark")
      }
    }
  }, [theme, isMounted])

  // Apply font size
  React.useEffect(() => {
    if (!isMounted) return

    const root = document.documentElement
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    }
    root.style.fontSize = fontSizeMap[fontSize]
  }, [fontSize, isMounted])

  // Apply animations
  React.useEffect(() => {
    if (!isMounted) return

    const root = document.documentElement
    if (!animationsEnabled) {
      root.style.setProperty("--animation-disabled", "1")
    } else {
      root.style.setProperty("--animation-disabled", "0")
    }
  }, [animationsEnabled, isMounted])

  // Save all settings to localStorage
  React.useEffect(() => {
    if (!isMounted) return

    try {
      const allSettings = {
        theme,
        fontSize,
        gridView,
        animationsEnabled,
        language,
        notificationPreferences,
        recommendationsEnabled,
        autoSaveCart,
        savedCards,
        twoFactorEnabled,
      }
      localStorage.setItem("funkystore_settings", JSON.stringify(allSettings))
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error)
    }
  }, [theme, fontSize, gridView, animationsEnabled, language, notificationPreferences, recommendationsEnabled, autoSaveCart, savedCards, twoFactorEnabled, isMounted])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const setFontSize = React.useCallback((newSize: FontSize) => {
    setFontSizeState(newSize)
  }, [])

  const setGridView = React.useCallback((newView: GridView) => {
    setGridViewState(newView)
  }, [])

  const setAnimationsEnabled = React.useCallback((newEnabled: boolean) => {
    setAnimationsEnabledState(newEnabled)
  }, [])

  const setLanguage = React.useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage)
  }, [])

  const setNotificationPreferences = React.useCallback((prefs: NotificationPreferences) => {
    setNotificationPreferencesState(prefs)
  }, [])

  const setRecommendationsEnabled = React.useCallback((enabled: boolean) => {
    setRecommendationsEnabledState(enabled)
  }, [])

  const setAutoSaveCart = React.useCallback((enabled: boolean) => {
    setAutoSaveCartState(enabled)
  }, [])

  const setSavedCards = React.useCallback((cards: SavedCard[]) => {
    setSavedCardsState(cards)
  }, [])

  const setTwoFactorEnabled = React.useCallback((enabled: boolean) => {
    setTwoFactorEnabledState(enabled)
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        theme,
        fontSize,
        gridView,
        animationsEnabled,
        language,
        notificationPreferences,
        recommendationsEnabled,
        autoSaveCart,
        savedCards,
        twoFactorEnabled,
        setTheme,
        setFontSize,
        setGridView,
        setAnimationsEnabled,
        setLanguage,
        setNotificationPreferences,
        setRecommendationsEnabled,
        setAutoSaveCart,
        setSavedCards,
        setTwoFactorEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = React.useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
