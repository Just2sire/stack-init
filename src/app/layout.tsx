import type { Metadata } from "next";
import { Space_Grotesk, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import JsonLd from "@/components/landing/JsonLd";

/**
 * Stack-Init Typography (from stack-init.html reference)
 * - Space Grotesk → body, UI, sans
 * - Syne          → display headings
 * - JetBrains Mono → code, field names, monospaced
 */

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stack-init-dev.vercel.app"),
  title: "StackInit | Tech-Stack Boilerplate Generator & Visual Scaffolder",
  description:
    "The ultimate tech-stack boilerplate generator. Visually design your data models and generate production-ready Laravel, React, Next.js, and Express codebases in seconds. No signup required.",
  keywords: [
    "tech-stack boilerplate generator",
    "visual scaffolder",
    "code generator",
    "code scaffolding",
    "project generator",
    "laravel boilerplate",
    "nextjs boilerplate",
    "express boilerplate",
    "nestjs boilerplate",
    "fastapi boilerplate",
    "full-stack generator",
    "database modeler",
    "ERD tool",
  ],
  openGraph: {
    title: "StackInit | Tech-Stack Boilerplate Generator",
    description: "Visually design and generate production-ready full-stack codebases in seconds.",
    url: "https://stack-init-dev.vercel.app",
    siteName: "StackInit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StackInit Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackInit | Tech-Stack Boilerplate Generator",
    description: "Generate production-ready codebases with a visual wizard.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        spaceGrotesk.variable,
        syne.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
