"use client";

import Image from "next/image";
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

function getSlidesPerView(width: number) {
  if (width <= 560) return 1;
  if (width <= 900) return 2;
  return 3;
}

const SLIDE_SELECTOR = "[data-promo-slide]";

export function HomePromos() {
  const { media } = useSiteTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const promos = [...media.featured].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activePage, setActivePage] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);

  const pageCount = Math.max(1, Math.ceil(promos.length / slidesPerView));

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
      const page = Math.round(track!.scrollLeft / (step * slidesPerView));
      setActivePage(Math.min(Math.max(page, 0), pageCount - 1));
    }

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [getScrollStep, pageCount, slidesPerView]);

  useEffect(() => {
    setActivePage((page) => Math.min(page, pageCount - 1));
  }, [pageCount]);

  if (promos.length === 0) return null;

  function scrollToPage(page: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = getScrollStep();
    track.scrollTo({
      left: step * slidesPerView * page,
      behavior: "smooth",
    });
    setActivePage(page);
  }

  function scrollBy(direction: -1 | 1) {
    scrollToPage(Math.max(0, Math.min(pageCount - 1, activePage + direction)));
  }

  return (
    <m.section
      className="bg-[var(--card)] px-0 pt-14 pb-4"
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

        <div className="relative">
          <button
            type="button"
            className="absolute top-[38%] -left-2 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/95 text-[var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 max-[900px]:hidden"
            onClick={() => scrollBy(-1)}
            aria-label="Previous offers"
            disabled={activePage === 0}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>

          <div
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:thin]"
            ref={trackRef}
          >
            {promos.map((item) => {
              const src = resolveCmsAssetUrl(item.url) ?? item.url;
              const isExternal = src.startsWith("http");
              const alt = item.alt.trim() || "Promotional offer";

              return (
                <figure
                  key={item.id}
                  data-promo-slide
                  className="m-0 shrink-0 grow-0 basis-[min(420px,88vw)] snap-start overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={640}
                    height={360}
                    className="block aspect-video h-full w-full object-cover"
                    sizes="(max-width: 560px) 88vw, (max-width: 900px) 45vw, 30vw"
                    unoptimized={isExternal}
                  />
                </figure>
              );
            })}
          </div>

          <button
            type="button"
            className="absolute top-[38%] -right-2 z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/95 text-[var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 max-[900px]:hidden"
            onClick={() => scrollBy(1)}
            aria-label="Next offers"
            disabled={activePage >= pageCount - 1}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>

        {pageCount > 1 ? (
          <div
            className="mt-4 flex justify-center gap-2"
            role="tablist"
            aria-label="Offer slides"
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                className={`h-2 w-2 rounded-full border-0 p-0 transition-colors ${index === activePage ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={index === activePage}
                onClick={() => scrollToPage(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </m.section>
  );
}
