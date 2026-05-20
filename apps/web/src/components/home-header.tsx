"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

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
  const isTicket = pathname === "/ticket";
  const isReturnPolicy = pathname === "/return-policy";
  const isTerms = pathname === "/terms-and-conditions";
  const isPrivacy = pathname === "/privacy-policy";
  const isContentsActive = isReturnPolicy || isTerms || isPrivacy;

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
          <Link href="/#contact">Contact Us</Link>
        </nav>
      </div>
    </header>
  );
}
