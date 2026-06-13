"use client";

import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

export function HomePaymentStrip() {
  const { footer, media } = useSiteTheme();
  const rawUrl = footer.paymentBannerUrl ?? media.footerPayment?.url ?? null;
  const paymentSrc = resolveCmsAssetUrl(rawUrl);
  const alt =
    media.footerPayment?.alt?.trim() || "Accepted payment methods";

  if (!paymentSrc) return null;

  return (
    <section className="bg-[var(--card)] px-0 py-12" aria-labelledby="home-payments-title">
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-payments-title"
          title="Payment methods"
          subtitle="Pay securely online or at our counters."
        />

        <div className="rounded-[14px] border border-[var(--border)] bg-[#fafaf9] px-6 py-5">
          <img
            src={paymentSrc}
            alt={alt}
            width={1100}
            height={120}
            className="block h-auto w-full"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
