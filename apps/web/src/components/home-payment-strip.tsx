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
    <section className="bg-[var(--card)] px-0 py-12" aria-labelledby="home-payments-title">
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-payments-title"
          title="Payment methods"
          subtitle="Pay securely online or at our counters."
        />

        <div className="rounded-[14px] border border-[var(--border)] bg-[#fafaf9] px-6 py-5">
          <Image
            src={paymentSrc}
            alt="Accepted payment methods"
            width={1100}
            height={120}
            className="block h-auto w-full"
            unoptimized={isExternal}
          />
        </div>
      </div>
    </section>
  );
}
