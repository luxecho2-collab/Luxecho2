import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminProvider } from "@/contexts/admin-context"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <AdminProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminProvider>
    )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-white overflow-hidden">
            <AdminSidebar />
            <main className="flex-grow overflow-y-auto transition-all duration-500 ease-in-out">
                {children}
            </main>
        </div>
    )
}
