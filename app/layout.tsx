import type { Metadata } from "next";
import { Baloo_2, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { FloatingBackground } from "@/components/layout/floating-background";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo"
});

export const metadata: Metadata = {
  title: "Allo Health Inventory Task",
  description: "Cartoon-inspired modern inventory reservation system with Google-authenticated checkout."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${baloo.variable}`}>
        <ThemeProvider>
          <Providers session={session}>
            <div className="relative min-h-screen overflow-hidden">
              <FloatingBackground />
              <div className="relative z-10">
                <Navbar />
                {children}
              </div>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
