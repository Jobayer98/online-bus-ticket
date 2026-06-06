"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

type Props = {
  className?: string;
};

function brandNameLines(companyName: string, tagline: string | null) {
  if (tagline) {
    const suffix = tagline.trim();
    const lowerName = companyName.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();
    if (lowerName.endsWith(lowerSuffix)) {
      const main = companyName.slice(0, companyName.length - suffix.length).trim();
      if (main) {
        return { main: main.toUpperCase(), sub: suffix.toUpperCase() };
      }
    }
    return { main: companyName.toUpperCase(), sub: suffix.toUpperCase() };
  }
  return { main: companyName.toUpperCase(), sub: null as string | null };
}

export function BrandLogo({ className = "brand-logo" }: Props) {
  const { profile } = useSiteTheme();
  const resolvedLogo = resolveCmsAssetUrl(profile.logoUrl);
  const isExternal = resolvedLogo?.startsWith("http") ?? false;
  const { main, sub } = brandNameLines(profile.companyName, profile.tagline);

  return (
    <Link href="/" className={className}>
      {resolvedLogo ? (
        <Image
          src={resolvedLogo}
          alt=""
          width={56}
          height={56}
          className="brand-logo__img"
          priority
          unoptimized={isExternal}
        />
      ) : (
        <span className="brand-logo__placeholder" aria-hidden>
          <svg viewBox="0 0 56 56" width={56} height={56} className="brand-logo__img">
            <rect width="56" height="56" rx="8" fill="var(--primary-muted, #e8f5e9)" />
            <path
              d="M12 36h32l-4-12H16l-4 12zm6-16h20l3 8H15l3-8z"
              fill="var(--primary, #2e7d32)"
            />
          </svg>
        </span>
      )}
      <span className="brand-logo__text">
        {main}
        {sub ? <small>{sub}</small> : null}
      </span>
    </Link>
  );
}
