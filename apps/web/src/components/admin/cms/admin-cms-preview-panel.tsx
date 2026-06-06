"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsPublishResultDto, CmsSiteBundleDto } from "@repo/shared";
import { AdminCmsDraftSitePreview } from "@/components/admin/cms/admin-cms-draft-site-preview";
import { CounterToast } from "@/components/counter/counter-toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPost } from "@/lib/api-client";
import { buildTenantPublicSiteUrl } from "@/lib/tenant-public-url";

export function AdminCmsPreviewPanel() {
  const [bundle, setBundle] = useState<CmsSiteBundleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<CmsPublishResultDto | null>(null);
  const [liveSiteUrl, setLiveSiteUrl] = useState<string | null>(null);
  useGlobalLoading(loading || publishing);

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
    setLiveSiteUrl(buildTenantPublicSiteUrl());
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

  const iframeSrc = useMemo(() => {
    if (liveSiteUrl) return liveSiteUrl;
    return typeof window !== "undefined" ? `${window.location.origin}/` : "/";
  }, [liveSiteUrl]);

  if (loading && !bundle) {
    return (
      <div className="cp-section">
        <p className="adm-muted">Loading draft preview…</p>
      </div>
    );
  }

  return (
    <div className="cp-section adm-cms-preview-panel">
      <CounterToast message={toast} onDismiss={() => setToast(null)} />
      <h3 className="adm-page-title">PREVIEW &amp; PUBLISH</h3>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="adm-form-card">
        <p className="adm-muted adm-cms-hint">
          <strong>Draft preview</strong> shows unpublished CMS changes from the API.{" "}
          <strong>Live site</strong> shows published content on your tenant subdomain (updates
          after you publish).
        </p>
        <div className="adm-cms-preview-actions">
          <button type="button" className="sp-btn-back" onClick={load} disabled={loading}>
            Refresh draft
          </button>
          <Link href="/admin/cms/full-preview" className="sp-filter-search adm-cms-preview-link">
            Full draft preview
          </Link>
          {liveSiteUrl ? (
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sp-filter-search adm-cms-preview-link"
            >
              Open live site
            </a>
          ) : (
            <span className="adm-muted adm-cms-hint">
              Set tenant cookie or use demo.lvh.me for live link
            </span>
          )}
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
          <section className="adm-cms-preview-section">
            <h4 className="adm-cms-preview-section__title">Draft (unpublished)</h4>
            <AdminCmsDraftSitePreview bundle={bundle} />
          </section>

          <div className="adm-cms-iframe-wrap">
            <h4 className="adm-cms-preview-section__title">Live site (published)</h4>
            <p className="adm-muted adm-cms-hint">
              iframe loads your tenant public URL — not the admin host. Publish to refresh.
            </p>
            <iframe
              title="Published public site"
              src={iframeSrc}
              className="adm-cms-site-iframe"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
