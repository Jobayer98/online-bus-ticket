"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNavMenu, type MobileNavItem } from "@/components/mobile-nav-menu";

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="home-nav-dropdown-chevron"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

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

  const mobileItems: MobileNavItem[] = [
    { type: "link", href: "/", label: "Home", active: isHome },
    { type: "link", href: "/about", label: "About Us", active: isAbout },
    { type: "link", href: "/contact", label: "Contact Us", active: isContact },
    { type: "link", href: "/ticket", label: "Download Ticket", active: isTicket },
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
    <header className="home-header">
      <div className="home-header-top">
        <Link href="/#counters" className="home-header-counters">
          <HomeIcon />
          Our Counters
        </Link>
      </div>
      <div className="home-header-main">
        <BrandLogo className="brand-logo home-logo" />
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
              <ChevronDownIcon />
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
          <Link href="/login" className={isLogin ? "is-active" : undefined}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
