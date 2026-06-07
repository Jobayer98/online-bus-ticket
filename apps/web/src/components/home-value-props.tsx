"use client";

import Link from "next/link";
import { HomeSectionHeader } from "@/components/home-section-header";
import { HOME_VALUE_PROPS_DEFAULTS, type HomeValueProp } from "@/lib/home-defaults";

function ValuePropIcon({ icon }: { icon: HomeValueProp["icon"] }) {
  switch (icon) {
    case "clock":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM3 20a5 5 0 0110 0M11 20a5 5 0 0110 0"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "headphones":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 14v4a2 2 0 002 2h1v-8H5a1 1 0 00-1 1zM20 14v4a2 2 0 01-2 2h-1v-8h2a1 1 0 011 1zM4 14a8 8 0 0116 0"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function HomeValueProps() {
  const items = HOME_VALUE_PROPS_DEFAULTS;

  return (
    <section className="home-value-props" aria-labelledby="home-value-props-title">
      <div className="home-section-inner">
        <HomeSectionHeader
          id="home-value-props-title"
          title="Why travel with us?"
          subtitle="Everything you need for a safe, comfortable trip."
        />

        <ul className="home-value-props-grid">
          {items.map((item) => (
            <li key={item.title} className="home-value-prop-card">
              <span className="home-value-prop-card__icon" aria-hidden>
                <ValuePropIcon icon={item.icon} />
              </span>
              <h3 className="home-value-prop-card__title">{item.title}</h3>
              <p className="home-value-prop-card__text">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="home-value-props-cta">
          <Link href="/about" className="home-btn home-btn--secondary">
            Learn more about us
          </Link>
        </div>
      </div>
    </section>
  );
}
