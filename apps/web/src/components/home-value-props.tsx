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

const secondaryBtnClass =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--primary)] bg-[var(--card)] px-5 py-2.5 text-[0.925rem] font-semibold tracking-wide text-[var(--primary)] no-underline transition-colors hover:bg-[var(--primary-light)]";

export function HomeValueProps() {
  const items = HOME_VALUE_PROPS_DEFAULTS;

  return (
    <section className="bg-[#fafaf9] px-0 py-14" aria-labelledby="home-value-props-title">
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-value-props-title"
          title="Why travel with us?"
          subtitle="Everything you need for a safe, comfortable trip."
        />

        <m.ul
          className="m-0 grid list-none grid-cols-4 gap-4 p-0 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          {items.map((item) => (
            <m.li
              key={item.title}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-5"
              variants={staggerItemVariants}
            >
              <span
                className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--primary-light)] text-[var(--primary)]"
                aria-hidden
              >
                <ValuePropIcon icon={item.icon} />
              </span>
              <h3 className="m-0 mb-2 text-base font-semibold text-[var(--text)]">
                {item.title}
              </h3>
              <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </m.li>
          ))}
        </m.ul>

        <div className="mt-8 text-center">
          <Link href="/about" className={secondaryBtnClass}>
            Learn more about us
          </Link>
        </div>
      </div>
    </section>
  );
}
