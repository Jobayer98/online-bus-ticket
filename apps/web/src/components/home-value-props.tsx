"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Clock, Headphones, Shield, Users } from "lucide-react";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/components/motion/variants";
import { HOME_VALUE_PROPS_DEFAULTS, type HomeValueProp } from "@/lib/home-defaults";

function ValuePropIcon({ icon }: { icon: HomeValueProp["icon"] }) {
  const props = { size: 24, strokeWidth: 1.75, "aria-hidden": true as const };
  switch (icon) {
    case "clock":
      return <Clock {...props} />;
    case "users":
      return <Users {...props} />;
    case "headphones":
      return <Headphones {...props} />;
    case "shield":
    default:
      return <Shield {...props} />;
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

        <m.ul
          className="home-value-props-grid"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {items.map((item) => (
            <m.li key={item.title} className="home-value-prop-card" variants={staggerItemVariants}>
              <span className="home-value-prop-card__icon" aria-hidden>
                <ValuePropIcon icon={item.icon} />
              </span>
              <h3 className="home-value-prop-card__title">{item.title}</h3>
              <p className="home-value-prop-card__text">{item.description}</p>
            </m.li>
          ))}
        </m.ul>

        <div className="home-value-props-cta">
          <Link href="/about" className="home-btn home-btn--secondary">
            Learn more about us
          </Link>
        </div>
      </div>
    </section>
  );
}
