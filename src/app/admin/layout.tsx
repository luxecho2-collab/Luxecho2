import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/server/auth"

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
        <div className="min-h-screen bg-black">
            {children}
        </div>
    )
}
