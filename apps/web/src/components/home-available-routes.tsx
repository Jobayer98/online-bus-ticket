"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
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

  return (
    <section className="home-routes" aria-labelledby="home-routes-title">
      <h2 id="home-routes-title" className="home-routes-title">
        AVAILABLE ROUTE
      </h2>
      <div className="home-routes-title-accent" aria-hidden />

      <div className="home-routes-panel">
        <ul className="home-routes-grid">
          {routes.map((route) => {
            const href = `/search/${route.routeSlug}/${today}`;

            return (
              <li key={route.id}>
                <Link href={href} className="home-route-card">
                  <span className="home-route-city">{route.fromStop.city}</span>
                  <BusIcon />
                  <span className="home-route-city">{route.toStop.city}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function HomeGallery() {
  const { media } = useSiteTheme();
  const images = [...media.featured].sort((a, b) => a.sortOrder - b.sortOrder);

  if (images.length === 0) return null;

  return (
    <section className="home-gallery">
      <div className="home-gallery-inner">
        {images.map((img) => {
          const src = resolveCmsAssetUrl(img.url) ?? img.url;
          const isExternal = src.startsWith("http");
          return (
            <div className="home-gallery-item" key={img.id}>
              <Image
                src={src}
                alt={img.alt}
                width={480}
                height={320}
                sizes="(max-width: 900px) 50vw, 25vw"
                unoptimized={isExternal}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomeHero({ children }: { children: React.ReactNode }) {
  const { media } = useSiteTheme();
  const heroUrl = resolveCmsAssetUrl(media.hero?.url ?? null) ?? "/images/home/hero.jpg";

  return (
    <section
      className="home-hero"
      style={{ backgroundImage: `url(${heroUrl})` }}
    >
      {children}
    </section>
  );
}
