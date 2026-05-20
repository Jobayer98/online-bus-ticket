"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSeatHoldRoute, releaseActiveHold } from "@/lib/active-hold";
import { MobileNavMenu } from "@/components/mobile-nav-menu";

const SHELL_LINKS = [
  { href: "/", label: "Search" },
  { href: "/ticket", label: "Download Ticket" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/counter", label: "Counter" },
  { href: "/admin", label: "Admin" },
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSeatHoldRoute(pathname)) {
      void releaseActiveHold();
    }
  }, [pathname]);

  const isSearch = pathname.startsWith("/search");
  const isCounter = pathname.startsWith("/counter");
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isMarketing =
    isHome ||
    pathname === "/about" ||
    pathname === "/ticket" ||
    pathname === "/return-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/privacy-policy";

  const showFallbackNav =
    !isSearch && !isMarketing && !isCounter && !isAdmin;

  return (
    <>
      {showFallbackNav && (
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand">
              BusTicket
            </Link>
            <MobileNavMenu
              menuLabel="Site navigation"
              items={SHELL_LINKS.map(({ href, label }) => ({
                type: "link" as const,
                href,
                label,
                active: pathname === href,
              }))}
            />
            <div className="site-nav">
              {SHELL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={pathname === href ? "is-active" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
      <main
        className={
          isSearch || isMarketing || isCounter || isAdmin
            ? "site-main site-main--flush"
            : "site-main"
        }
      >
        {children}
      </main>
    </>
  );
}
