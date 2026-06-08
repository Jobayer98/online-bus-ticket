import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "My bookings — Bus Booking",
  description: "View your bus ticket bookings and account.",
};

export default function DashboardPage() {
  return (
    <div className="m-0 flex min-h-screen flex-col bg-[var(--bg)] p-0">
      <HomeHeader />
      <CustomerDashboard />
      <SiteFooter />
    </div>
  );
}
