"use client";

import Image from "next/image";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

export function HomePaymentStrip() {
  const { footer } = useSiteTheme();
  const paymentSrc =
    resolveCmsAssetUrl(footer.paymentBannerUrl) ??
    "/images/home/ssl-commerz-inline.png";

  if (!paymentSrc) return null;

  const isExternal = paymentSrc.startsWith("http");

  return (
    <section className="home-payments" aria-labelledby="home-payments-title">
      <div className="home-section-inner">
        <HomeSectionHeader
          id="home-payments-title"
          title="Payment methods"
          subtitle="Pay securely online or at our counters."
        />

        <div className="home-payments-frame">
          <Image
            src={paymentSrc}
            alt="Accepted payment methods"
            width={1100}
            height={120}
            className="home-payments-img"
            unoptimized={isExternal}
          />
        </div>
      </div>
    </section>
  );
}
