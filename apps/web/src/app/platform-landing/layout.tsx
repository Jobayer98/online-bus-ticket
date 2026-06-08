import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OmniBus | Modern Bus Management & Online Ticketing",
  description:
    "Run your entire bus business from one platform. Unified bookings, dynamic seat maps, fleet management, and instant payments for operators in Bangladesh.",
};

export default function PlatformLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} scroll-smooth`}>{children}</div>
  );
}
