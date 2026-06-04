"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  brandPaletteToCssVars,
  type CmsPublishResultDto,
  type CmsSiteBundleDto,
} from "@repo/shared";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPost } from "@/lib/api-client";
import { resolveCmsAssetUrl } from "@/lib/cms-admin-api";

export function AdminCmsPreviewPanel() {
  const [bundle, setBundle] = useState<CmsSiteBundleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<CmsPublishResultDto | null>(null);
  useGlobalLoading(loading || publishing);

  const previewVars = useMemo(() => {
    if (!bundle) return {};
    return brandPaletteToCssVars(bundle.theme.palette);
  }, [bundle]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiGet<CmsSiteBundleDto>("/admin/cms/preview")
      .then((r) => setBundle(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load preview"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function publish() {
    if (
      !window.confirm(
        "Publish all draft CMS content to the live site? This replaces the current published content.",
      )
    ) {
      return;
    }
    setPublishing(true);
    setError("");
    try {
      const res = await apiPost<CmsPublishResultDto>("/admin/cms/publish", {});
      setPublishResult(res.data);
      setToast(
        `Published at ${new Date(res.data.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}`,
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  if (loading && !bundle) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading draft preview…</p>
      </div>
    );
  }

  const heroUrl = bundle?.media.hero?.url;
  const featuredCount = bundle?.media.featured.length ?? 0;

  return (
    <div className="cp-section">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">PREVIEW &amp; PUBLISH</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="adm-form-card">
        <p className="adm-muted adm-cms-hint">
          Draft preview below reflects unsaved API state. The public site shows published
          content until you publish.
        </p>
        <div className="adm-cms-preview-actions">
          <button type="button" className="sp-btn-back" onClick={load} disabled={loading}>
            Refresh preview
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="sp-filter-search adm-cms-preview-link"
          >
            Open public site
          </a>
          <button
            type="button"
            className="sp-filter-search adm-cms-publish-btn"
            onClick={publish}
            disabled={publishing}
          >
            {publishing ? "Publishing…" : "Publish draft to live"}
          </button>
        </div>
        {publishResult ? (
          <p className="adm-muted adm-cms-hint">
            Last publish: {publishResult.counts.profile} profile, {publishResult.counts.theme}{" "}
            theme, {publishResult.counts.pages} pages, {publishResult.counts.media} media,{" "}
            {publishResult.counts.featuredRoutes} routes, {publishResult.counts.footer} footer.
          </p>
        ) : null}
      </div>

      {bundle ? (
        <>
          <div
            className="adm-cms-draft-preview"
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
                  <span className="adm-cms-draft-preview__tagline">
                    {bundle.profile.tagline}
                  </span>
                ) : null}
              </div>
            </header>
            {heroUrl ? (
              <div
                className="adm-cms-draft-preview__hero"
                style={{
                  backgroundImage: `url(${resolveCmsAssetUrl(heroUrl)})`,
                }}
              />
            ) : null}
            <div className="adm-cms-draft-preview__meta">
              <span>{featuredCount} featured images</span>
              <span>{bundle.featuredRoutes.filter((r) => r.isVisible).length} routes</span>
              <span>{bundle.footer.barLinks.length} footer links</span>
            </div>
          </div>

          <div className="adm-cms-iframe-wrap">
            <p className="adm-muted adm-cms-hint">
              Live site iframe (published content — updates after publish):
            </p>
            <iframe
              title="Public site preview"
              src="/"
              className="adm-cms-site-iframe"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
