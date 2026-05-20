import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import { GlobalLoadingProvider } from "@/components/global-loading-provider";
import { SiteShell } from "@/components/site-shell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bus Ticket — Online Booking",
  description: "Book bus tickets online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <GlobalLoadingProvider>
          <SiteShell>{children}</SiteShell>
        </GlobalLoadingProvider>
      </body>
    </html>
  );
}
