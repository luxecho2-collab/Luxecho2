import type { Metadata } from "next";
import { Poppins, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins"
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-barlow"
});

import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Luxecho | Ultra-Premium E-Commerce",
  description: "Experience modern luxury with Luxecho.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth-provider";
import { LoadingScreen } from "@/components/layout/loading-screen";
import FloatingSettings from "@/components/ui/floating-settings";
import { SettingsProvider } from "@/contexts/settings-context";
import { NavSpacer } from "@/components/layout/nav-spacer"
import { AnnouncementBar } from "@/components/home/announcement-bar"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", poppins.variable, playfair.variable, barlow.variable)}>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme="light"
          >
            <AuthProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="grow">
                <NavSpacer />
                {children}
              </main>
              <Footer />
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
