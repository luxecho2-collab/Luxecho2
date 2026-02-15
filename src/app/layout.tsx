import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Funky Store",
  description: "Ultra-Premium E-Commerce",
};

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", inter.variable)}>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Navbar />
              <main className="grow pt-20">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
