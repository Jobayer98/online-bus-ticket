"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSiteThemeOptional } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

type Props = {
  active: boolean;
};

export const btnBusyClass =
  "pointer-events-none relative opacity-88 after:ml-[0.45em] after:inline-block after:h-[0.85em] after:w-[0.85em] after:animate-spin after:rounded-full after:border-2 after:border-current after:border-r-transparent after:align-[-0.1em] after:content-['']";

export function BrandLoadingOverlay({ active }: Props) {
  const [mounted, setMounted] = useState(false);
  const theme = useSiteThemeOptional();
  const logoSrc = theme ? resolveCmsAssetUrl(theme.profile.logoUrl) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (!active || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/82 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="relative flex h-[88px] w-[88px] items-center justify-center before:absolute before:inset-0 before:animate-spin before:rounded-full before:border-[3px] before:border-[var(--primary-muted,#e8f5e9)] before:border-t-[var(--primary,#2e7d32)] before:border-r-[var(--primary-hover,#1b5e20)] before:content-['']">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt=""
            className="relative z-[1] h-[52px] w-[52px] animate-pulse object-contain"
            width={52}
            height={52}
          />
        ) : (
          <span
            className="relative z-[1] h-3 w-3 animate-pulse rounded-full bg-[var(--primary,#2e7d32)]"
            aria-hidden
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
