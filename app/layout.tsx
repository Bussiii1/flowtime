import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { DemoBanner } from "@/components/demo-banner";
import { Analytics } from "@vercel/analytics/react"
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FlowTime - Staff Management",
  description: "Le pointage simplifié pour l'HORECA saisonnier. FlowTime - Staff management SaaS for The Flow beach bar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <NextTopLoader color="#FF6B6B" showSpinner={false} />
        <DemoBanner />
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
