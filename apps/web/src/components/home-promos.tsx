"use client";

import Image from "next/image";
import { useRef } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  fadeInVariants,
} from "@/components/motion/variants";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

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
    <m.section
      className="home-promos"
      aria-labelledby="home-promos-title"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeInVariants}
    >
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
            <ChevronLeft size={20} aria-hidden />
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
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </m.section>
  );
}
