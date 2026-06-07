"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bus } from "lucide-react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  heroTaglineVariants,
  heroWidgetVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/components/motion/variants";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
import { HOME_TAGLINE_FALLBACK } from "@/lib/home-defaults";
import { getTodayIso } from "@/lib/trip-date";

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

        <m.ul
          className="home-routes-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {routes.map((route) => {
            const href = `/search/${route.routeSlug}/${today}`;

            return (
              <m.li key={route.id} variants={staggerItemVariants}>
                <Link href={href} className="home-route-card">
                  <span className="home-route-card__cities">
                    <span className="home-route-city">{route.fromStop.city}</span>
                    <Bus className="home-route-bus" size={20} aria-hidden />
                    <span className="home-route-city">{route.toStop.city}</span>
                  </span>
                  <span className="home-route-card__action">View schedules</span>
                </Link>
              </m.li>
            );
          })}
        </m.ul>
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
        <m.p
          className="home-hero__eyebrow"
          variants={heroTaglineVariants}
          initial="initial"
          animate="animate"
        >
          {profile.companyName}
        </m.p>
        <m.h1
          className="home-hero__headline"
          variants={heroTaglineVariants}
          initial="initial"
          animate="animate"
        >
          {tagline}
        </m.h1>
      </div>
      <m.div
        className="home-search-wrap"
        variants={heroWidgetVariants}
        initial="initial"
        animate="animate"
      >
        {children}
      </m.div>
    </section>
  );
}
