"use client";

import Image from "next/image";
import Link from "next/link";
import { m, useScroll, useTransform } from "framer-motion";
import {
  Building2,
  Globe,
  Home,
  Mail,
  MapPin,
  ChevronUp,
} from "lucide-react";
import type { CmsContactIcon } from "@repo/shared";
import { useSiteTheme } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
import "./site-footer.css";

function ContactIcon({ icon }: { icon: CmsContactIcon }) {
  const props = { size: 14, "aria-hidden": true as const };
  switch (icon) {
    case "home":
      return <Home {...props} />;
    case "building":
      return <Building2 {...props} />;
    case "globe":
      return <Globe {...props} />;
    case "pin":
    default:
      return <MapPin {...props} />;
  }
}

function BackToTop() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [400, 600], [0, 1]);
  const y = useTransform(scrollY, [400, 600], [20, 0]);

  return (
    <m.button
      type="button"
      className="site-footer-top"
      style={{ opacity, y }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ChevronUp size={22} aria-hidden />
    </m.button>
  );
}

export function SiteFooter() {
  const { profile, footer } = useSiteTheme();
  const paymentSrc =
    resolveCmsAssetUrl(footer.paymentBannerUrl) ??
    "/images/home/ssl-commerz-inline.png";
  const paymentIsExternal = paymentSrc.startsWith("http");

  return (
    <footer className="site-footer">
      <section className="site-footer-contact" id="contact">
        <h2>Contact Information</h2>
        <hr className="site-footer-rule" />
        <div className="site-footer-contact-body">
          <ul className="site-footer-address">
            {footer.contactLines.map((line, index) => (
              <li key={`${line.icon}-${index}`}>
                <ContactIcon icon={line.icon} />
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
          <p className="site-footer-email">
            <Mail size={14} aria-hidden />
            <a href={`mailto:${footer.email}`}>{footer.email}</a>
          </p>
        </div>
        <hr className="site-footer-rule" />
      </section>

      {paymentSrc ? (
        <section className="site-footer-payments" aria-label="Payment methods">
          <div className="site-footer-payments-frame">
            <Image
              src={paymentSrc}
              alt="Accepted payment methods"
              width={1100}
              height={120}
              className="site-footer-payments-img"
              unoptimized={paymentIsExternal}
            />
          </div>
        </section>
      ) : null}

      <div className="site-footer-bar">
        <div className="site-footer-bar-inner">
          <p className="site-footer-bar-left">
            {footer.poweredByText ? (
              <>
                <span>{footer.poweredByText}</span>
                <span className="site-footer-bar-sep" aria-hidden>
                  |
                </span>
              </>
            ) : null}
            {footer.barLinks.map((link, index) => (
              <span key={link.href}>
                <Link href={link.href}>{link.label}</Link>
                {index < footer.barLinks.length - 1 ? (
                  <span className="site-footer-bar-sep" aria-hidden>
                    |
                  </span>
                ) : null}
              </span>
            ))}
          </p>
          {profile.tradeLicenseNo ? (
            <p className="site-footer-bar-right">
              Trade License: {profile.tradeLicenseNo}
            </p>
          ) : null}
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
