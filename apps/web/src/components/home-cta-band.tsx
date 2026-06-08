"use client";

import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";

const primaryBtnClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-transparent bg-[var(--primary)] px-5 py-2.5 text-[0.925rem] font-semibold tracking-wide text-[var(--text-on-primary,#fff)] no-underline transition-colors hover:bg-[var(--primary-hover)]";

const ghostOnDarkBtnClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-white/35 bg-transparent px-5 py-2.5 text-[0.925rem] font-semibold tracking-wide text-white/92 no-underline transition-colors hover:border-white/55 hover:bg-white/8";

export function HomeCtaBand() {
  const { profile } = useSiteTheme();

  return (
    <section
      className="bg-gradient-to-br from-[var(--primary-hover,#166534)] via-[var(--primary,#15803d)] to-[#14532d] px-0 py-12 text-white"
      aria-labelledby="home-cta-title"
    >
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-6 px-4 max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <h2
            id="home-cta-title"
            className="m-0 mb-1.5 text-[clamp(1.35rem,2.5vw,1.75rem)] font-bold tracking-tight"
          >
            Ready to start your journey?
          </h2>
          <p className="m-0 max-w-[34rem] text-[0.95rem] leading-relaxed text-white/88">
            Book with {profile.companyName} — fast search, secure payment, instant e-ticket.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 max-[560px]:w-full max-[560px]:flex-col">
          <Link href="/#home-search" className={primaryBtnClass}>
            Book your ticket
          </Link>
          <Link href="/ticket" className={ghostOnDarkBtnClass}>
            Download ticket
          </Link>
          <Link href="/contact" className={ghostOnDarkBtnClass}>
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
