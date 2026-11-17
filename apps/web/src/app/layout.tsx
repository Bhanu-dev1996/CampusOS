import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusOS",
  description: "Multi-tenant education command center",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        inter.variable,
        jetbrainsMono.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-background text-foreground"
      >
        <AppProviders>{children}</AppProviders>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}