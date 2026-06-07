"use client";

import Image from "next/image";
import { useRef } from "react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomePromos() {
  const { media } = useSiteTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const promos = [...media.featured].sort((a, b) => a.sortOrder - b.sortOrder);

  if (promos.length === 0) return null;

  function scrollBy(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.85 * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="home-promos" aria-labelledby="home-promos-title">
      <div className="home-section-inner">
        <HomeSectionHeader
          id="home-promos-title"
          title="Offers & promos"
          subtitle="Seasonal deals and travel updates from our team."
        />

        <div className="home-promos-carousel">
          <button
            type="button"
            className="home-promos-nav home-promos-nav--prev"
            onClick={() => scrollBy(-1)}
            aria-label="Previous offers"
          >
            <ChevronIcon direction="left" />
          </button>

          <div className="home-promos-track" ref={trackRef}>
            {promos.map((item) => {
              const src = resolveCmsAssetUrl(item.url) ?? item.url;
              const isExternal = src.startsWith("http");
              const caption = item.alt.trim();

              return (
                <article key={item.id} className="home-promo-card">
                  <div className="home-promo-card__media">
                    <Image
                      src={src}
                      alt={caption || "Promotional offer"}
                      width={640}
                      height={360}
                      sizes="(max-width: 640px) 88vw, 420px"
                      unoptimized={isExternal}
                    />
                  </div>
                  {caption ? (
                    <p className="home-promo-card__caption">{caption}</p>
                  ) : null}
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className="home-promos-nav home-promos-nav--next"
            onClick={() => scrollBy(1)}
            aria-label="Next offers"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}
