import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@repo/ui";
import { Toaster } from "@repo/ui/toaster";

import "~/styles/globals.css";

import { getServiceBaseUrl } from "@repo/service-discovery";

export const metadata: Metadata = {
  metadataBase: new URL(getServiceBaseUrl("admin-frontend")),
  title: "VanNova",
  description: "Simple monorepo with shared backend for web & mobile apps",
  icons: {
    icon: [
      {
        url: "/auth-images/vannova-icon.png",
      },
    ],
  },
  openGraph: {
    title: "Create T3 Turbo",
    description: "Simple monorepo with shared backend for web & mobile apps",

    url: "https://create-t3-turbo.vercel.app",
    siteName: "Create T3 Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@jullerino",
    creator: "@jullerino",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        {props.children}
        <div className="absolute bottom-4 right-4"></div>
        <Toaster />
      </body>
    </html>
  );
}
