"use client";

import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
import { HOME_TAGLINE_FALLBACK } from "@/lib/home-defaults";
import { getTodayIso } from "@/lib/trip-date";

function BusIcon() {
  return (
    <svg
      className="home-route-bus"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V9l-1.5-4.5A2 2 0 0 0 17.48 3H6.52A2 2 0 0 0 4.5 4.5L3 9v7zm2.5-8h11L17 9H7l-.5-1zM7.5 18a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}

export function HomeAvailableRoutes() {
  const { featuredRoutes } = useSiteTheme();
  const today = getTodayIso();
  const routes = featuredRoutes
    .filter((route) => route.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (routes.length === 0) return null;

  return (
    <section className="home-routes" aria-labelledby="home-routes-title">
      <div className="home-section-inner">
        <HomeSectionHeader
          id="home-routes-title"
          title="Popular routes"
          subtitle="Quick links to our most travelled destinations."
        />

        <ul className="home-routes-grid">
          {routes.map((route) => {
            const href = `/search/${route.routeSlug}/${today}`;

            return (
              <li key={route.id}>
                <Link href={href} className="home-route-card">
                  <span className="home-route-card__cities">
                    <span className="home-route-city">{route.fromStop.city}</span>
                    <BusIcon />
                    <span className="home-route-city">{route.toStop.city}</span>
                  </span>
                  <span className="home-route-card__action">View schedules</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function HomeHero({ children }: { children: React.ReactNode }) {
  const { media, profile } = useSiteTheme();
  const heroUrl = resolveCmsAssetUrl(media.hero?.url ?? null) ?? "/images/home/hero.jpg";
  const tagline = profile.tagline?.trim() || HOME_TAGLINE_FALLBACK;

  return (
    <section
      className="home-hero"
      style={{ backgroundImage: `url(${heroUrl})` }}
    >
      <div className="home-hero__content">
        <p className="home-hero__eyebrow">{profile.companyName}</p>
        <h1 className="home-hero__headline">{tagline}</h1>
      </div>
      {children}
    </section>
  );
}
