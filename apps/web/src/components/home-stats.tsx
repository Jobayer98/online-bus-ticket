"use client";

import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
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

        <ul className="home-stats-grid">
          {stats.map((stat) => (
            <li key={stat.label} className="home-stat-card">
              <span className="home-stat-card__value">{stat.value}</span>
              <span className="home-stat-card__label">{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
