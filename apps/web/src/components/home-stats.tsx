"use client";

import { m } from "framer-motion";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/components/motion/variants";
import { HOME_STATS_DEFAULTS } from "@/lib/home-defaults";

export function HomeStats() {
  const { profile } = useSiteTheme();
  const stats = HOME_STATS_DEFAULTS;

  return (
    <section className="home-stats" aria-labelledby="home-stats-title">
      <div className="home-section-inner">
        <HomeSectionHeader
          id="home-stats-title"
          title={`${profile.companyName} at a glance`}
          subtitle="Trusted by travellers across our network."
        />

        <m.ul
          className="home-stats-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {stats.map((stat) => (
            <m.li key={stat.label} className="home-stat-card" variants={staggerItemVariants}>
              <span className="home-stat-card__value fare">{stat.value}</span>
              <span className="home-stat-card__label">{stat.label}</span>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}
