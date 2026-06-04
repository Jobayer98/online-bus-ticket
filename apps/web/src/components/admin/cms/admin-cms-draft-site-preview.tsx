"use client";

import { useMemo } from "react";
import { brandPaletteToCssVars, type CmsSiteBundleDto } from "@repo/shared";
import { resolveCmsAssetUrl } from "@/lib/cms-admin-api";

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
      className={`adm-cms-draft-preview adm-cms-draft-preview--full ${className}`.trim()}
      style={{
        ...previewVars,
        fontFamily: `"${bundle.theme.fontFamily}", system-ui, sans-serif`,
      } as React.CSSProperties}
    >
      <header
        className="adm-cms-draft-preview__header"
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
            className="adm-cms-draft-preview__logo"
          />
        ) : null}
        <div>
          <strong>{bundle.profile.companyName}</strong>
          {bundle.profile.tagline ? (
            <span className="adm-cms-draft-preview__tagline">{bundle.profile.tagline}</span>
          ) : null}
        </div>
      </header>
      {heroUrl ? (
        <div
          className="adm-cms-draft-preview__hero adm-cms-draft-preview__hero--tall"
          style={{ backgroundImage: `url(${resolveCmsAssetUrl(heroUrl)})` }}
        />
      ) : (
        <div className="adm-cms-draft-preview__hero adm-cms-draft-preview__hero--placeholder">
          <span>No hero image in draft</span>
        </div>
      )}
      {bundle.media.featured.length > 0 ? (
        <div className="adm-cms-draft-preview__gallery">
          {bundle.media.featured.map((m) => (
            <div
              key={m.id}
              className="adm-cms-draft-preview__gallery-item"
              style={{ backgroundImage: `url(${resolveCmsAssetUrl(m.url)})` }}
            />
          ))}
        </div>
      ) : null}
      <footer className="adm-cms-draft-preview__footer">
        {bundle.footer.contactLines.map((line, i) => (
          <span key={`${line.icon}-${i}`}>{line.text}</span>
        ))}
        {bundle.footer.email ? <span>{bundle.footer.email}</span> : null}
        <span className="adm-cms-draft-preview__powered">{bundle.footer.poweredByText}</span>
      </footer>
    </div>
  );
}
