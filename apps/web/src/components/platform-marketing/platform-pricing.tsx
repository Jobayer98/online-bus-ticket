"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for single-route operators.",
    monthly: 49,
    yearly: 39,
    features: ["Up to 5 Buses", "Online Booking Engine", "1 Counter POS"],
    cta: "Get Started",
    href: "/onboarding",
    highlighted: false,
  },
  {
    name: "Growth",
    description: "For regional companies scaling up.",
    monthly: 149,
    yearly: 119,
    features: [
      "Up to 25 Buses",
      "Unlimited Counters",
      "Fleet Telemetry Dashboard",
      "Priority Support",
    ],
    cta: "Start 14-Day Free Trial",
    href: "/onboarding",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Full fleet automation for majors.",
    monthly: null,
    yearly: null,
    features: [
      "Unlimited Buses",
      "API Access & Webhooks",
      "Dedicated Account Manager",
      "On-premise Deployment",
    ],
    cta: "Contact Sales",
    href: "/onboarding",
    highlighted: false,
  },
] as const;

export function PlatformPricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      className="py-24 px-4 md:px-10 bg-surface-container-low/30"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-on-surface mb-4">
            Predictable Pricing for Growth
          </h2>
          <p className="text-on-surface-variant">
            Choose the plan that fits your current fleet size.
          </p>
          <div className="mt-8 inline-flex items-center p-1 bg-surface-container-highest rounded-xl">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                !yearly
                  ? "bg-surface-container-lowest shadow-sm text-on-surface"
                  : "text-on-surface-variant"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                yearly
                  ? "bg-surface-container-lowest shadow-sm text-on-surface"
                  : "text-on-surface-variant"
              }`}
            >
              Yearly <span className="text-primary">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-surface-container-lowest p-8 rounded-3xl flex flex-col ${
                plan.highlighted
                  ? "border-2 border-primary relative transform md:scale-105 shadow-xl"
                  : "border border-outline-variant/30 hover:border-primary/30 transition-colors"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-xs font-bold">
                  RECOMMENDED
                </div>
              )}
              <div className="mb-8">
                <h3
                  className={`font-bold text-xl mb-2 ${
                    plan.highlighted ? "text-primary" : ""
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="text-on-surface-variant text-sm">
                  {plan.description}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  {plan.monthly != null ? (
                    <>
                      <span className="text-4xl font-bold">
                        ${yearly ? plan.yearly : plan.monthly}
                      </span>
                      <span className="text-on-surface-variant">/mo</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">Custom</span>
                  )}
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="size-5 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                  plan.highlighted
                    ? "bg-primary text-on-primary shadow-lg hover:bg-forest-deep"
                    : "border border-outline hover:bg-surface-container"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
