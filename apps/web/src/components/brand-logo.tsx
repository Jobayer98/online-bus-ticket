"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteTheme } from "@/components/site-theme-provider";
import { resolveCmsAssetUrl } from "@/lib/cms-client";

const FALLBACK_LOGO = "/images/logo/logo.png";

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
  const logoSrc = resolveCmsAssetUrl(profile.logoUrl) ?? FALLBACK_LOGO;
  const isExternal = logoSrc.startsWith("http");
  const { main, sub } = brandNameLines(profile.companyName, profile.tagline);

  return (
    <Link href="/" className={className}>
      <Image
        src={logoSrc}
        alt=""
        width={56}
        height={56}
        className="brand-logo__img"
        priority
        unoptimized={isExternal}
      />
      <span className="brand-logo__text">
        {main}
        {sub ? <small>{sub}</small> : null}
      </span>
    </Link>
  );
}
