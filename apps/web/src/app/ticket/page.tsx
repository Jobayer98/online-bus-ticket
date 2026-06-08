import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import { TicketDownloadForm } from "@/components/ticket-download-form";

export const metadata: Metadata = {
  title: "Download Ticket — Bus Booking",
  description: "Download your bus ticket using PNR number and mobile number.",
};

export default function TicketPage() {
  return (
    <div className="m-0 flex min-h-screen flex-col bg-white p-0">
      <HomeHeader />

      <main className="mx-auto flex-1 max-w-[920px] px-6 py-12 text-center max-[640px]:px-4 max-[640px]:py-8">
        <h1 className="mb-7 text-[2.25rem] font-bold tracking-wide text-[#111] max-[640px]:text-[1.75rem]">
          Download Ticket
        </h1>
        <TicketDownloadForm />
      </main>

      <SiteFooter />
    </div>
  );
}
