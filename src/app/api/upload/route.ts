import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/server/auth"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    headers() // Force dynamic
    const session = await getServerSession(authOptions)

    if (session?.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const formData = await req.formData()
        const files = formData.getAll("files") as File[]

        if (!files || files.length === 0) {
            return new NextResponse("No files uploaded", { status: 400 })
        }

        const uploadDir = join(process.cwd(), "public", "uploads")

        // Create directory if it doesn't exist
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) { }

        const urls = []

        for (const file of files) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Create a unique filename
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
            const path = join(uploadDir, filename)

            await writeFile(path, buffer)
            urls.push(`/uploads/${filename}`)
        }

        return NextResponse.json({ urls })
    } catch (error) {
        console.error("Upload Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
