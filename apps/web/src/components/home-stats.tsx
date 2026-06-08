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
    <section className="bg-[var(--card)] px-0 py-12" aria-labelledby="home-stats-title">
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-stats-title"
          title={`${profile.companyName} at a glance`}
          subtitle="Trusted by travellers across our network."
        />

        <m.ul
          className="m-0 grid list-none grid-cols-4 gap-4 p-0 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {stats.map((stat) => (
            <m.li
              key={stat.label}
              className="flex flex-col gap-1.5 rounded-[14px] bg-gradient-to-br from-[var(--primary-hover,#166534)] to-[var(--primary,#15803d)] px-4 py-5 text-center text-white shadow-[0_4px_14px_rgba(21,128,61,0.22)]"
              variants={staggerItemVariants}
            >
              <span className="text-[clamp(1.35rem,2.5vw,1.75rem)] font-bold tracking-tight tabular-nums">
                {stat.value}
              </span>
              <span className="text-[0.8125rem] leading-snug text-white/88">
                {stat.label}
              </span>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}
