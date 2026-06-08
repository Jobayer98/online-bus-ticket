/** Default home-page copy until CMS home-sections epic (see docs/FEATURES.md). */

export type HomeStatItem = {
  value: string;
  label: string;
};

export type HomeValueProp = {
  title: string;
  description: string;
  icon: "shield" | "clock" | "users" | "headphones";
};

export const HOME_STATS_DEFAULTS: HomeStatItem[] = [
  { value: "25K+", label: "Happy customers" },
  { value: "100K+", label: "Tickets sold" },
  { value: "75+", label: "Bus routes" },
  { value: "50+", label: "Coaches in fleet" },
];

export const HOME_VALUE_PROPS_DEFAULTS: HomeValueProp[] = [
  {
    icon: "shield",
    title: "Comfortable seats",
    description: "Spacious AC and non-AC coaches with reclining seats for a relaxed journey.",
  },
  {
    icon: "clock",
    title: "On-time service",
    description: "Reliable departure times and live schedule updates so you can plan with confidence.",
  },
  {
    icon: "users",
    title: "Expert drivers",
    description: "Experienced, licensed drivers who know every route and prioritize your safety.",
  },
  {
    icon: "headphones",
    title: "24/7 support",
    description: "Counter staff and phone support when you need help with booking or your ticket.",
  },
];

export const HOME_TAGLINE_FALLBACK = "Search and book intercity bus tickets in minutes.";
