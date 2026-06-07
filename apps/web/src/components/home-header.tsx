"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNavMenu, type MobileNavItem } from "@/components/mobile-nav-menu";

export function HomeHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const isContact = pathname === "/contact";
  const isTicket = pathname === "/ticket";
  const isReturnPolicy = pathname === "/return-policy";
  const isTerms = pathname === "/terms-and-conditions";
  const isPrivacy = pathname === "/privacy-policy";
  const isLogin = pathname === "/login";
  const isContentsActive = isReturnPolicy || isTerms || isPrivacy;

  const { scrollY } = useScroll();
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const boxShadow = useTransform(
    shadowOpacity,
    (v) =>
      `0 4px 6px rgba(0,0,0,${v * 0.07}), 0 2px 4px rgba(0,0,0,${v * 0.06})`,
  );
  const logoScale = useSpring(useTransform(scrollY, [0, 80], [1, 0.75]), {
    stiffness: 300,
    damping: 30,
  });

  const mobileItems: MobileNavItem[] = [
    { type: "link", href: "/", label: "Home", active: isHome },
    { type: "link", href: "/about", label: "About Us", active: isAbout },
    { type: "link", href: "/contact", label: "Contact Us", active: isContact },
    { type: "link", href: "/ticket", label: "Download Ticket", active: isTicket },
    { type: "link", href: "/#counters", label: "Our Counters" },
    { type: "link", href: "/return-policy", label: "Return Policy", active: isReturnPolicy },
    {
      type: "link",
      href: "/terms-and-conditions",
      label: "Terms & Conditions",
      active: isTerms,
    },
    { type: "link", href: "/privacy-policy", label: "Privacy Policy", active: isPrivacy },
    { type: "link", href: "/login", label: "Login", active: isLogin },
  ];

  return (
    <m.header className="home-header" style={{ boxShadow }}>
      <div className="home-header-main">
        <m.div className="home-logo-wrap" style={{ scale: logoScale }}>
          <BrandLogo className="brand-logo home-logo" />
        </m.div>
        <MobileNavMenu items={mobileItems} menuLabel="Main navigation" />
        <nav className="home-nav" aria-label="Main">
          <Link href="/" className={isHome ? "is-active" : undefined}>
            Home
          </Link>
          <Link href="/about" className={isAbout ? "is-active" : undefined}>
            About Us
          </Link>
          <Link href="/ticket" className={isTicket ? "is-active" : undefined}>
            Download Ticket
          </Link>
          <div
            className={`home-nav-dropdown${isContentsActive ? " is-open-section" : ""}`}
          >
            <button
              type="button"
              className={`home-nav-dropdown-trigger${isContentsActive ? " is-active" : ""}`}
              aria-haspopup="true"
              aria-current={isContentsActive ? "page" : undefined}
            >
              Contents
              <ChevronDown className="home-nav-dropdown-chevron" size={14} aria-hidden />
            </button>
            <ul className="home-nav-dropdown-menu">
              <li>
                <Link
                  href="/return-policy"
                  className={isReturnPolicy ? "is-active" : undefined}
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className={isTerms ? "is-active" : undefined}
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className={isPrivacy ? "is-active" : undefined}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <Link href="/contact" className={isContact ? "is-active" : undefined}>
            Contact Us
          </Link>
          <Link href="/#counters" className="home-nav-counters">
            <Store size={15} aria-hidden />
            Our Counters
          </Link>
        </nav>
        <Link href="/login" className="home-header-login">
          Login
        </Link>
      </div>
    </m.header>
  );
}
