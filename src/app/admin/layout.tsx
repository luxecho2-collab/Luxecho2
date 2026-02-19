import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
        <div className="flex min-h-screen bg-white">
            <AdminSidebar />
            <div className="flex-grow">
                {children}
            </div>
        </div>
    )
}
