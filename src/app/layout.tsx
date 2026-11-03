import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { WishlistProvider } from "@/components/wishlist-provider";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
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
      <body className={manrope.variable}>
        <ThemeProvider>
          <WishlistProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <Toaster position="bottom-right" richColors />
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
