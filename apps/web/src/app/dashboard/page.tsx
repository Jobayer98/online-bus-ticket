import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "My bookings — Shahzadpur Travels",
  description: "View your bus ticket bookings and account.",
};

export default function DashboardPage() {
  return (
    <div className="home-page dash-page">
      <HomeHeader />
      <CustomerDashboard />
      <SiteFooter />
    </div>
  );
}
