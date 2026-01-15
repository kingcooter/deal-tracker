import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { CommandProvider } from "@/components/providers/command-provider";
import { CommandPaletteWrapper } from "@/components/command-palette-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DealTracker - CRE Deal Management",
  description: "Commercial real estate deal tracking and project management",
};

import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="bg-background text-foreground antialiased selection:bg-blue-500/30">
        <NuqsAdapter>
          <QueryProvider>
            <CommandProvider>
              <CommandPaletteWrapper />
              {children}
            </CommandProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
