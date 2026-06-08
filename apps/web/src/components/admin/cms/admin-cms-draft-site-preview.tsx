"use client";

import { useMemo } from "react";
import { brandPaletteToCssVars, type CmsSiteBundleDto } from "@repo/shared";
import { resolveCmsAssetUrl } from "@/lib/cms-admin-api";
import {
  admCmsDraftPreview,
  admCmsDraftPreviewFooter,
  admCmsDraftPreviewFull,
  admCmsDraftPreviewGallery,
  admCmsDraftPreviewGalleryItem,
  admCmsDraftPreviewHeader,
  admCmsDraftPreviewHero,
  admCmsDraftPreviewHeroPlaceholder,
  admCmsDraftPreviewHeroTall,
  admCmsDraftPreviewLogo,
  admCmsDraftPreviewPowered,
  admCmsDraftPreviewTagline,
} from "../admin-tw";

type Props = {
  bundle: CmsSiteBundleDto;
  className?: string;
};

/** Read-only draft site shell for admin full preview. */
export function AdminCmsDraftSitePreview({ bundle, className = "" }: Props) {
  const previewVars = useMemo(
    () => brandPaletteToCssVars(bundle.theme.palette),
    [bundle.theme.palette],
  );
  const heroUrl = bundle.media.hero?.url;

  return (
    <div
      className={`${admCmsDraftPreview} ${admCmsDraftPreviewFull} ${className}`.trim()}
      style={{
        ...previewVars,
        fontFamily: `"${bundle.theme.fontFamily}", system-ui, sans-serif`,
      } as React.CSSProperties}
    >
      <header
        className={admCmsDraftPreviewHeader}
        style={{
          background: bundle.theme.palette.primary,
          color: bundle.theme.palette.textOnPrimary,
        }}
      >
        {bundle.profile.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveCmsAssetUrl(bundle.profile.logoUrl)}
            alt=""
            className={admCmsDraftPreviewLogo}
          />
        ) : null}
        <div>
          <strong>{bundle.profile.companyName}</strong>
          {bundle.profile.tagline ? (
            <span className={admCmsDraftPreviewTagline}>{bundle.profile.tagline}</span>
          ) : null}
        </div>
      </header>
      {heroUrl ? (
        <div
          className={`${admCmsDraftPreviewHero} ${admCmsDraftPreviewHeroTall}`}
          style={{ backgroundImage: `url(${resolveCmsAssetUrl(heroUrl)})` }}
        />
      ) : (
        <div className={`${admCmsDraftPreviewHero} ${admCmsDraftPreviewHeroPlaceholder}`}>
          <span>No hero image in draft</span>
        </div>
      )}
      {bundle.media.featured.length > 0 ? (
        <div className={admCmsDraftPreviewGallery}>
          {bundle.media.featured.map((m) => (
            <div
              key={m.id}
              className={admCmsDraftPreviewGalleryItem}
              style={{ backgroundImage: `url(${resolveCmsAssetUrl(m.url)})` }}
            />
          ))}
        </div>
      ) : null}
      <footer className={admCmsDraftPreviewFooter}>
        {bundle.footer.contactLines.map((line, i) => (
          <span key={`${line.icon}-${i}`}>{line.text}</span>
        ))}
        {bundle.footer.email ? <span>{bundle.footer.email}</span> : null}
        <span className={admCmsDraftPreviewPowered}>{bundle.footer.poweredByText}</span>
      </footer>
    </div>
  );
}
