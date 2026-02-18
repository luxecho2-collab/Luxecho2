import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { type NextAuthOptions, type DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            role: "USER" | "ADMIN"
            phone?: string | null
        } & DefaultSession["user"]
    }

    interface User {
        role: "USER" | "ADMIN"
        phone?: string | null
    }
}

export const authOptions: NextAuthOptions = {
    callbacks: {
        session: ({ session, user }) => ({
            ...session,
            user: {
                ...session.user,
                id: user.id,
                role: user.role,
                phone: user.phone,
            },
        }),
    },
    adapter: PrismaAdapter(db),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            sendVerificationRequest: async ({ identifier, url, provider }) => {
                const { host } = new URL(url)
                const nodemailer = await import("nodemailer")
                const transport = nodemailer.createTransport(provider.server)

                const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luxecho Secure Access</title>
</head>
<body style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 60px 20px;">
        <tr>
            <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; border: 1px solid #f3f4f6; padding: 40px; background-color: #ffffff;">
                    <tr>
                        <td align="center" style="padding-bottom: 40px;">
                            <div style="font-weight: 900; letter-spacing: 0.5em; text-transform: uppercase; font-size: 14px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 10px; display: inline-block;">
                                LUXECHO
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 30px;">
                            <h1 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; margin: 0; color: #000000; line-height: 1.1;">
                                SECURE ACCESS <span style="color: #e5e7eb;">INITIALIZED</span>
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 40px;">
                            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #9ca3af; margin: 0; line-height: 1.6;">
                                A request to access the Luxecho dashboard has been initialized for <strong>${identifier}</strong>. Use the secure vector below to verify your identity.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 40px;">
                            <a href="${url}" style="display: block; width: 100%; height: 60px; line-height: 60px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; transition: all 0.3s ease;">
                                VERIFY IDENTITY
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #f3f4f6; padding-top: 30px;">
                            <p style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #d1d5db; margin: 0;">
                                ID: ${host.toUpperCase()} • v2.0.42
                            </p>
                            <p style="font-size: 9px; font-weight: 700; color: #9ca3af; margin-top: 10px;">
                                If you did not initialize this sync, please disregard this transmission. Link expires in 24 hours.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `SECURE ACCESS: Luxecho Identity Verification`,
                    text: `Sign in to Luxecho: ${url}`,
                    html,
                })
                const failed = result.rejected.concat(result.pending).filter(Boolean)
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
                }
            },
            maxAge: 15 * 60, // 15 minutes
        }),
        CredentialsProvider({
            id: "phone",
            name: "Phone Number",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone || !credentials?.otp) return null

                // MOCK OTP LOGIC (In production, verify against Redis/DB)
                if (credentials.otp === "123456") {
                    const user = await db.user.upsert({
                        where: { phone: credentials.phone },
                        update: { phoneVerified: new Date() },
                        create: {
                            phone: credentials.phone,
                            phoneVerified: new Date(),
                            role: "USER"
                        }
                    })
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        phone: user.phone,
                    }
                }
                return null
            }
        })
    ],
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
}
