"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNavMenu, type MobileNavItem } from "@/components/mobile-nav-menu";

const navLinkClass =
  "relative pb-[0.35rem] text-[0.833rem] font-medium text-[var(--text)] no-underline transition-colors hover:text-[var(--primary)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-[var(--primary)] after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100";

const navLinkActiveClass = `${navLinkClass} text-[var(--primary)] after:scale-x-100`;

export function HomeHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isContact = pathname === "/contact";
  const isTicket = pathname === "/ticket";
  const isLogin = pathname === "/login";

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
    { type: "link", href: "/contact", label: "Contact Us", active: isContact },
    { type: "link", href: "/ticket", label: "Download Ticket", active: isTicket },
    { type: "link", href: "/#counters", label: "Our Counters" },
    { type: "link", href: "/login", label: "Login", active: isLogin },
  ];

  return (
    <m.header
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-white"
      style={{ boxShadow }}
    >
      <div className="mx-auto flex min-h-16 max-w-[var(--container-public)] items-center justify-between gap-4 px-4 py-2 max-md:flex-nowrap max-md:px-3">
        <m.div className="origin-left shrink-0" style={{ scale: logoScale }}>
          <BrandLogo />
        </m.div>
        <MobileNavMenu items={mobileItems} menuLabel="Main navigation" />
        <nav className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-0.5 max-md:hidden" aria-label="Main">
          <Link href="/" className={isHome ? navLinkActiveClass : navLinkClass}>
            Home
          </Link>
          <Link href="/ticket" className={isTicket ? navLinkActiveClass : navLinkClass}>
            Download Ticket
          </Link>
          <Link href="/contact" className={isContact ? navLinkActiveClass : navLinkClass}>
            Contact Us
          </Link>
          <Link
            href="/#counters"
            className={`${navLinkClass} inline-flex items-center gap-1.5 max-[767px]:hidden`}
          >
            Our Counters
          </Link>
        </nav>
        <Link
          href="/login"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] px-[1.1rem] text-[0.722rem] font-semibold text-[var(--text-on-primary,#fff)] no-underline transition-colors hover:bg-[var(--primary-hover)] max-md:hidden after:hidden"
        >
          Login
        </Link>
      </div>
    </m.header>
  );
}
