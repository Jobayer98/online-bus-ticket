"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { ChevronUp, Globe, Mail, Phone } from "lucide-react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

const FOOTER_NAV = [
  { href: "/", label: "Home" },
  { href: "/ticket", label: "Download Ticket" },
  { href: "/#counters", label: "Our Counters" },
  { href: "/login", label: "Login" },
] as const;

const LEGAL_PATHS = new Set([
  "/privacy-policy",
  "/terms-and-conditions",
  "/return-policy",
]);

const footerLinkClass =
  "text-white/75 no-underline transition-colors hover:text-white";

const footerLinkActiveClass = `${footerLinkClass} font-semibold text-white`;

function brandDescription(companyName: string, tagline: string | null) {
  if (tagline && tagline.trim().length > 28) {
    return tagline.trim();
  }
  return `Book safe, comfortable bus travel with ${companyName}. Online ticketing, counter support, and reliable schedules across Bangladesh.`;
}

function BackToTop() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [400, 600], [0, 1]);
  const y = useTransform(scrollY, [400, 600], [20, 0]);

  return (
    <m.button
      type="button"
      className="fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-[var(--primary)] p-0 text-[var(--text-on-primary,#fff)] shadow-[var(--shadow-md)] hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] focus-visible:shadow-[0_0_0_3px_var(--primary-light)] min-[901px]:right-6 min-[901px]:bottom-6"
      style={{ opacity, y }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ChevronUp size={22} aria-hidden />
    </m.button>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const { profile, footer } = useSiteTheme();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  const resolvedLogo = resolveCmsAssetUrl(profile.logoUrl);
  const isExternalLogo = resolvedLogo?.startsWith("http") ?? false;
  const year = new Date().getFullYear();

  const legalLinks = footer.barLinks.filter((link) =>
    LEGAL_PATHS.has(link.href),
  );
  const supportLinks = footer.barLinks.filter(
    (link) => !LEGAL_PATHS.has(link.href),
  );

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterJoined(true);
    setNewsletterEmail("");
  }

  return (
    <footer className="relative mt-auto">
      <div className="bg-[var(--green-900,#14532d)] px-4 py-10 text-white min-[901px]:px-6 min-[901px]:py-12">
        <div className="mx-auto grid max-w-[var(--container-public)] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2.5 no-underline text-white"
            >
              {resolvedLogo ? (
                <Image
                  src={resolvedLogo}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded"
                  unoptimized={isExternalLogo}
                />
              ) : null}
              <span className="text-base font-bold tracking-wide">
                {profile.companyName}
              </span>
            </Link>
            <p className="m-0 mb-4 text-sm leading-relaxed text-white/80">
              {brandDescription(profile.companyName, profile.tagline)}
            </p>
            <div className="flex gap-3">
              <Link
                href="/contact"
                aria-label="Contact us"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Globe size={18} aria-hidden />
              </Link>
              <a
                href={`mailto:${footer.email}`}
                aria-label="Email us"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Mail size={18} aria-hidden />
              </a>
              <Link
                href="/contact"
                aria-label="Phone and address"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <Phone size={18} aria-hidden />
              </Link>
            </div>
          </div>

          <nav aria-label="Quick links">
            <h2 className="m-0 mb-4 text-sm font-bold tracking-wide text-white uppercase">
              Quick Links
            </h2>
            <ul className="m-0 list-none space-y-2 p-0">
              {FOOTER_NAV.map(({ href, label }) => {
                const isActive =
                  href === "/"
                    ? pathname === "/"
                    : href === "/#counters"
                      ? false
                      : pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={isActive ? footerLinkActiveClass : footerLinkClass}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label="Support">
            <h2 className="m-0 mb-4 text-sm font-bold tracking-wide text-white uppercase">
              Support
            </h2>
            <ul className="m-0 list-none space-y-2 p-0">
              <li>
                <Link href="/contact" className={footerLinkClass}>
                  Help Center
                </Link>
              </li>
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      pathname === link.href ? footerLinkActiveClass : footerLinkClass
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      pathname === link.href ? footerLinkActiveClass : footerLinkClass
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section id="contact">
            <h2 className="m-0 mb-4 text-sm font-bold tracking-wide text-white uppercase">
              Newsletter
            </h2>
            <p className="m-0 mb-4 text-sm leading-relaxed text-white/80">
              Get the latest travel deals and route updates delivered to your
              inbox.
            </p>
            {newsletterJoined ? (
              <p className="m-0 text-sm font-medium text-[var(--green-100,#dcfce7)]" role="status">
                Thanks for subscribing.
              </p>
            ) : (
              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  name="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Your email"
                  autoComplete="email"
                  required
                  aria-label="Email address"
                  className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-md border-0 bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
                >
                  Join
                </button>
              </form>
            )}
          </section>
        </div>
      </div>

      <div className="border-t border-white/15 bg-[var(--green-950,#052e16)] px-4 py-4 text-[0.722rem] text-white/88 min-[901px]:px-6 min-[901px]:py-[1.15rem]">
        <div className="mx-auto flex max-w-[var(--container-public)] flex-wrap items-center justify-between gap-2 max-[700px]:flex-col max-[700px]:text-center">
          <p className="m-0">
            © {year} {profile.companyName}. All rights reserved.
            {footer.poweredByText ? (
              <span className="text-white/70"> {footer.poweredByText}</span>
            ) : null}
            {profile.tradeLicenseNo ? (
              <span className="text-white/70">
                {" "}
                Trade License: {profile.tradeLicenseNo}
              </span>
            ) : null}
          </p>
          {legalLinks.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/92 no-underline hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
