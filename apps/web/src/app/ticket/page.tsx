import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { TicketDownloadForm } from "@/components/ticket-download-form";
import "../home.css";
import "./ticket.css";

export const metadata: Metadata = {
  title: "Download Ticket — Shahzadpur Travels",
  description: "Download your bus ticket using PNR number and mobile number.",
};

export default function TicketPage() {
  return (
    <div className="home-page ticket-page">
      <HomeHeader />

      <main className="ticket-download-main">
        <h1>Download Ticket</h1>
        <TicketDownloadForm />
      </main>

      <SiteFooter />
    </div>
  );
}
