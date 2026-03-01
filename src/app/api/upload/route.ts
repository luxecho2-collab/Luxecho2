import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/server/auth"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

        const urls: string[] = []

        for (const file of files) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Upload to Cloudinary via buffer
            const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "luxecho/products",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error || !result) return reject(error)
                        resolve(result as { secure_url: string })
                    }
                )
                uploadStream.end(buffer)
            })

            urls.push(result.secure_url)
        }

        return NextResponse.json({ urls })
    } catch (error) {
        console.error("Upload Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
