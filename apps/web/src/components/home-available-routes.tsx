"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Bus } from "lucide-react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  heroWidgetVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/components/motion/variants";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
import { getTodayIso } from "@/lib/trip-date";

export function HomeAvailableRoutes() {
  const { featuredRoutes } = useSiteTheme();
  const today = getTodayIso();
  const routes = featuredRoutes
    .filter((route) => route.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (routes.length === 0) return null;

  return (
    <section className="bg-[#fafaf9] px-0 py-14" aria-labelledby="home-routes-title">
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-routes-title"
          title="Popular routes"
          subtitle="Quick links to our most travelled destinations."
        />

        <m.ul
          className="m-0 grid list-none grid-cols-3 gap-4 p-0 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {routes.map((route) => {
            const href = `/search/${route.routeSlug}/${today}`;

            return (
              <m.li key={route.id} variants={staggerItemVariants}>
                <Link
                  href={href}
                  className="flex min-h-24 w-full flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-inherit no-underline shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] hover:border-[var(--primary)] hover:shadow-[var(--shadow-md)]"
                >
                  <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <span className="truncate text-left text-[0.9375rem] font-semibold tracking-tight text-[var(--text)]">
                      {route.fromStop.city}
                    </span>
                    <Bus className="shrink-0 justify-self-center text-[var(--primary)]" size={20} aria-hidden />
                    <span className="truncate text-right text-[0.9375rem] font-semibold tracking-tight text-[var(--text)]">
                      {route.toStop.city}
                    </span>
                  </span>
                  <span className="text-[0.8125rem] font-semibold text-[var(--primary)]">
                    View schedules
                  </span>
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
  const { media } = useSiteTheme();
  const heroUrl =
    resolveCmsAssetUrl(media.hero?.url ?? null) ?? "/images/home/hero.jpg";

  return (
    <section
      className="relative flex min-h-[520px] flex-col items-center justify-end bg-[#052e16] bg-cover bg-center bg-no-repeat px-4 pb-0 max-[900px]:min-h-[420px] max-md:min-h-[260px] after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-[rgba(5,46,22,0.15)] after:to-[rgba(5,46,22,0.72)] after:content-['']"
      style={{ backgroundImage: `url(${heroUrl})` }}
    >
      <m.div
        className="relative z-[1] mx-auto w-full max-w-[var(--container-public)] translate-y-1/2 max-[900px]:translate-y-[40%] max-md:px-2"
        variants={heroWidgetVariants}
        initial="initial"
        animate="animate"
      >
        {children}
      </m.div>
    </section>
  );
}
