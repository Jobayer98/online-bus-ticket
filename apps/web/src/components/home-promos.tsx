"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteTheme } from "@/components/site-theme-provider";
import { HomeSectionHeader } from "@/components/home-section-header";
import {
  defaultViewport,
  fadeInVariants,
} from "@/components/motion/variants";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

const TRACK_GAP_REM = 1;

function getSlidesPerView(width: number) {
  if (width <= 560) return 1;
  if (width <= 900) return 2;
  if (width <= 1100) return 3;
  return 4;
}

const SLIDE_SELECTOR = "[data-promo-slide]";

const navBtnClass =
  "absolute top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-[var(--primary)] text-[var(--text-on-primary)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-40 max-[900px]:hidden";

export function HomePromos() {
  const { media } = useSiteTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const promos = [...media.featured].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);

  const maxIndex = Math.max(0, promos.length - slidesPerView);
  const dotCount = maxIndex + 1;

  const slideBasis = `calc((100% - ${(slidesPerView - 1) * TRACK_GAP_REM}rem) / ${slidesPerView})`;

  const getScrollStep = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const slide = track.querySelector(SLIDE_SELECTOR);
    if (!(slide instanceof HTMLElement)) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    return slide.offsetWidth + gap;
  }, []);

  useEffect(() => {
    function updateSlidesPerView() {
      setSlidesPerView(getSlidesPerView(window.innerWidth));
    }

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      const step = getScrollStep();
      if (!step) return;
      const index = Math.round(track!.scrollLeft / step);
      setActiveIndex(Math.min(Math.max(index, 0), maxIndex));
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [getScrollStep, maxIndex]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  if (promos.length === 0) return null;

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = getScrollStep();
    const nextIndex = Math.max(0, Math.min(maxIndex, index));
    track.scrollTo({
      left: step * nextIndex,
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  }

  function scrollBy(direction: -1 | 1) {
    scrollToIndex(activeIndex + direction);
  }

  return (
    <m.section
      className="bg-[var(--bg)] px-0 pt-14 pb-4"
      aria-labelledby="home-promos-title"
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeInVariants}
    >
      <div className="mx-auto max-w-[1100px] px-4">
        <HomeSectionHeader
          id="home-promos-title"
          title="Offers & promos"
          subtitle="Seasonal deals and travel updates from our team."
        />

        <div className="relative rounded-[var(--radius-lg)] bg-[var(--card)] p-3 shadow-[var(--shadow-md)] sm:p-4">
          <button
            type="button"
            className={`${navBtnClass} left-0 -translate-x-1/2`}
            onClick={() => scrollBy(-1)}
            aria-label="Previous offers"
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={22} aria-hidden />
          </button>

          <div
            className="flex gap-4 overflow-x-auto scroll-smooth [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            ref={trackRef}
          >
            {promos.map((item) => {
              const src = resolveCmsAssetUrl(item.url) ?? item.url;
              const alt = item.alt.trim() || "Promotional offer";

              return (
                <figure
                  key={item.id}
                  data-promo-slide
                  className="m-0 shrink-0 grow-0 snap-start overflow-hidden rounded-[var(--radius-md)] bg-[var(--card)]"
                  style={{ flexBasis: slideBasis }}
                >
                  <img
                    src={src}
                    alt={alt}
                    width={400}
                    height={400}
                    className="block aspect-square h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              );
            })}
          </div>

          <button
            type="button"
            className={`${navBtnClass} right-0 translate-x-1/2`}
            onClick={() => scrollBy(1)}
            aria-label="Next offers"
            disabled={activeIndex >= maxIndex}
          >
            <ChevronRight size={22} aria-hidden />
          </button>
        </div>

        {maxIndex > 0 ? (
          <div
            className="mt-5 flex justify-center gap-2.5"
            role="tablist"
            aria-label="Offer slides"
          >
            {Array.from({ length: dotCount }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                className={`h-2.5 w-2.5 rounded-full border-0 p-0 transition-colors ${index === activeIndex ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === activeIndex}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </m.section>
  );
}
