"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSeatHoldRoute, releaseActiveHold } from "@/lib/active-hold";
import { MobileNavMenu } from "@/components/mobile-nav-menu";

const PublicMotionProvider = dynamic(
  () =>
    import("@/components/public-motion-provider").then(
      (m) => m.PublicMotionProvider,
    ),
  { ssr: false },
);

const SHELL_LINKS = [
  { href: "/", label: "Search" },
  { href: "/ticket", label: "Download Ticket" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/counter", label: "Counter" },
  { href: "/admin", label: "Admin" },
] as const;

function hasTenantSlugCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)tenant-slug=/.test(document.cookie);
}

function isPlatformMarketingRoute(pathname: string): boolean {
  const isPlatformPath =
    pathname === "/" ||
    pathname === "/platform-landing" ||
    pathname === "/onboarding";
  return isPlatformPath && !hasTenantSlugCookie();
}

function isPublicMotionRoute(pathname: string): boolean {
  const isSearch =
    pathname.startsWith("/search") ||
    /^\/booking\/[^/]+\/(payment|confirmation)$/.test(pathname);
  const isBooking = pathname.startsWith("/booking");
  const isMarketing =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/ticket" ||
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname === "/return-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/privacy-policy";
  return isSearch || isBooking || isMarketing;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSeatHoldRoute(pathname)) {
      void releaseActiveHold();
    }
  }, [pathname]);

  const isSearch =
    pathname.startsWith("/search") ||
    /^\/booking\/[^/]+\/(payment|confirmation)$/.test(pathname);
  const isCounter = pathname.startsWith("/counter");
  const isAdmin = pathname.startsWith("/admin");
  const isPlatform = pathname.startsWith("/platform");
  const isPlatformMarketing = isPlatformMarketingRoute(pathname);
  const isHome = pathname === "/";
  const isMarketing =
    isHome ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/ticket" ||
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname === "/return-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/privacy-policy";

  const showFallbackNav =
    !isSearch &&
    !isMarketing &&
    !isCounter &&
    !isAdmin &&
    !isPlatform &&
    !isPlatformMarketing;

  const useMotion = isPublicMotionRoute(pathname);

  const mainClass =
    isSearch ||
    isMarketing ||
    isCounter ||
    isAdmin ||
    isPlatform ||
    isPlatformMarketing
      ? "min-h-screen"
      : "min-h-[calc(100vh-57px)]";

  const mainContent = <main className={mainClass}>{children}</main>;

  return (
    <>
      {showFallbackNav && (
        <nav className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="mx-auto flex max-w-[var(--container-public)] flex-wrap items-center gap-4 max-md:flex-nowrap max-md:justify-between">
            <Link
              href="/"
              className="mr-auto font-bold text-[var(--primary)] no-underline max-md:mr-0 max-md:min-w-0 max-md:flex-1"
            >
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
            <div className="flex flex-wrap items-center gap-4 max-md:hidden">
              {SHELL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`no-underline ${pathname === href ? "font-semibold text-[var(--primary)]" : "text-[var(--text)]"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
      {useMotion ? (
        <PublicMotionProvider>{mainContent}</PublicMotionProvider>
      ) : (
        mainContent
      )}
    </>
  );
}
