"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSiteThemeOptional } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";
import "./brand-loading-overlay.css";

type Props = {
  active: boolean;
};

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
      className="brand-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="brand-loading-overlay__ring">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt=""
            className="brand-loading-overlay__logo"
            width={52}
            height={52}
          />
        ) : (
          <span className="brand-loading-overlay__dot" aria-hidden />
        )}
      </div>
    </div>,
    document.body,
  );
}
