import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "StudioSpace — Room for your next big idea",
    template: "%s | StudioSpace",
  },
  description:
    "Discover distinctive creative studios, production spaces, and workrooms. Find the right room for your next project with StudioSpace.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <WishlistProvider>
              <Suspense fallback={<div className="header-loading" aria-hidden="true" />}>
                <SiteHeader />
              </Suspense>
              {children}
              <SiteFooter />
              <Toaster position="bottom-right" richColors />
            </WishlistProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
