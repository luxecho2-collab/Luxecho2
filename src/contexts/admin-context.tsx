"use client"

import * as React from "react"

interface AdminContextType {
    isSidebarCollapsed: boolean
    toggleSidebar: () => void
}

const AdminContext = React.createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

    // Sync with localStorage if desired, but for now just state
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev)

    return (
        <AdminContext.Provider value={{ isSidebarCollapsed, toggleSidebar }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const context = React.useContext(AdminContext)
    if (context === undefined) {
        throw new Error("useAdmin must be used within an AdminProvider")
    }
    return context
}
