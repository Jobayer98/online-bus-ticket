import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "../policy-page.css";

export const metadata: Metadata = {
  title: "Terms & Conditions — Shahzadpur Travels",
  description: "Terms and conditions for using Shahzadpur Travels website and services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="home-page policy-page">
      <HomeHeader />

      <main className="policy-main">
        <h1 className="policy-title">Terms &amp; Conditions</h1>

        <article className="policy-body">
          <section className="policy-section">
            <p>
              Welcome to Shahzadpur Travels. By accessing or using this website and
              our online bus ticket booking services, you agree to comply with and
              be bound by the following Terms &amp; Conditions. Please read them
              carefully before making a booking.
            </p>
            <p>
              These Terms &amp; Conditions are incorporated with and should be read
              together with our{" "}
              <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
              <Link href="/return-policy">Return Policy</Link>.
            </p>
          </section>

          <section className="policy-section">
            <h2>Use of the Website</h2>
            <p>
              You agree to use this website only for lawful purposes and in a manner
              that does not infringe the rights of others or restrict their use of
              the website. You must provide accurate and complete information when
              booking tickets or creating an account.
            </p>
            <p>
              Shahzadpur Travels reserves the right to refuse service, cancel
              bookings, or restrict access to the website at its discretion,
              including for suspected fraud, abuse, or violation of these terms.
            </p>
          </section>

          <section className="policy-section">
            <h2>Bookings and Tickets</h2>
            <p>
              A booking is confirmed only after successful payment and issuance of
              a ticket with a valid PNR (passenger number). You are responsible for
              verifying journey details, travel date, boarding point, and passenger
              information before completing payment.
            </p>
            <p>
              Tickets are issued subject to seat availability and schedule
              confirmation. Shahzadpur Travels may change schedules, routes, or
              coaches due to operational requirements; affected passengers will be
              informed as per applicable policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Payment</h2>
            <p>
              All fares are displayed in Bangladeshi Taka unless stated otherwise.
              Payment must be completed through the payment methods offered on this
              website. You agree to provide valid payment details and authorize
              charges for the total booking amount.
            </p>
          </section>

          <section className="policy-section">
            <h2>Cancellation, Refund and Changes</h2>
            <p>
              Please refer to our{" "}
              <Link href="/return-policy">Return Policy</Link>. Unless otherwise
              stated in writing by Shahzadpur Travels, all tickets are
              non-refundable and non-changeable once purchased.
            </p>
          </section>

          <section className="policy-section">
            <h2>Limitation of Liability</h2>
            <p>
              Shahzadpur Travels shall not be liable for indirect, incidental, or
              consequential losses arising from use of the website or travel
              services, except where liability cannot be excluded under applicable
              law. Our liability for any claim relating to a booking is limited to
              the fare paid for that booking.
            </p>
          </section>

          <section className="policy-section">
            <h2>Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of Bangladesh.
              Any dispute arising from use of this website or our services shall be
              subject to the exclusive jurisdiction of the courts in Dhaka,
              Bangladesh.
            </p>
          </section>

          <section className="policy-section">
            <h2>Changes to Terms</h2>
            <p>
              Shahzadpur Travels may update these Terms &amp; Conditions at any
              time without prior notice. Continued use of the website after changes
              are posted constitutes acceptance of the revised terms. Please review
              this page periodically.
            </p>
          </section>
        </article>

        <hr className="policy-divider" />
      </main>

      <SiteFooter />
    </div>
  );
}
