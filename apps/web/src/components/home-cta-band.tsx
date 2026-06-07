"use client";

import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";

export function HomeCtaBand() {
  const { profile } = useSiteTheme();

  return (
    <section className="home-cta-band" aria-labelledby="home-cta-title">
      <div className="home-section-inner home-cta-band__inner">
        <div className="home-cta-band__copy">
          <h2 id="home-cta-title" className="home-cta-band__title">
            Ready to start your journey?
          </h2>
          <p className="home-cta-band__subtitle">
            Book with {profile.companyName} — fast search, secure payment, instant e-ticket.
          </p>
        </div>

        <div className="home-cta-band__actions">
          <Link href="/#home-search" className="home-btn home-btn--primary">
            Book your ticket
          </Link>
          <Link href="/ticket" className="home-btn home-btn--ghost-on-dark">
            Download ticket
          </Link>
          <Link href="/contact" className="home-btn home-btn--ghost-on-dark">
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
