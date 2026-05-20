"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSeatHoldRoute, releaseActiveHold } from "@/lib/active-hold";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSeatHoldRoute(pathname)) {
      void releaseActiveHold();
    }
  }, [pathname]);
  const isSearch = pathname.startsWith("/search");
  const isHome = pathname === "/";
  const isMarketing =
    isHome ||
    pathname === "/about" ||
    pathname === "/ticket" ||
    pathname === "/return-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/privacy-policy";

  return (
    <>
      {!isSearch && !isMarketing && (
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand">
              BusTicket
            </Link>
            <Link href="/">Search</Link>
            <Link href="/ticket">Download Ticket</Link>
            <Link href="/login">Login</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/counter">Counter</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </nav>
      )}
      <main
        className={
          isSearch || isMarketing ? "site-main site-main--flush" : "site-main"
        }
      >
        {children}
      </main>
    </>
  );
}
