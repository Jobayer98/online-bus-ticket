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

const logoLinkClass =
  "inline-flex shrink-0 items-center gap-2 no-underline text-[#222]";

export function BrandLogo({ className = logoLinkClass }: Props) {
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
          className="block h-[52px] w-auto shrink-0 max-[560px]:h-11"
          priority
          unoptimized={isExternal}
        />
      ) : (
        <span aria-hidden>
          <svg
            viewBox="0 0 56 56"
            width={56}
            height={56}
            className="block h-[52px] w-auto shrink-0 max-[560px]:h-11"
          >
            <rect width="56" height="56" rx="8" fill="var(--primary-muted, #e8f5e9)" />
            <path
              d="M12 36h32l-4-12H16l-4 12zm6-16h20l3 8H15l3-8z"
              fill="var(--primary, #2e7d32)"
            />
          </svg>
        </span>
      )}
      <span className="text-[1.05rem] font-bold leading-tight tracking-wide max-[560px]:text-[0.95rem]">
        {main}
        {sub ? (
          <small className="mt-0 block text-[0.7rem] font-medium tracking-widest text-[#666] max-[560px]:text-[0.65rem]">
            {sub}
          </small>
        ) : null}
      </span>
    </Link>
  );
}
