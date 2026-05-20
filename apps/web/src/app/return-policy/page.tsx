import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "../policy-page.css";

export const metadata: Metadata = {
  title: "Return Policy — Shahzadpur Travels",
  description: "Ticket return and refund policy for Shahzadpur Travels.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="home-page policy-page return-policy-page">
      <HomeHeader />

      <main className="policy-main">
        <h1 className="policy-title">Return Policy</h1>

        <article className="policy-body policy-body--indented">
          <p className="policy-subtitle">টিকেট ফেরতের নিয়মাবলীঃ</p>
          <ul className="policy-list">
            <li>
              All tickets are non-refundable and non-changeable once purchased.
            </li>
          </ul>
        </article>

        <hr className="policy-divider" />
      </main>

      <SiteFooter />
    </div>
  );
}
