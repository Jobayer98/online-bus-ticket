"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CmsPublishResultDto, CmsSiteBundleDto } from "@repo/shared";
import { AdminCmsDraftSitePreview } from "@/components/admin/cms/admin-cms-draft-site-preview";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { toast } from "@/lib/toast";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet, apiPost } from "@/lib/api-client";
import { buildTenantPublicSiteUrl } from "@/lib/tenant-public-url";
import {
  admCmsHint,
  admCmsIframeWrap,
  admCmsPreviewActions,
  admCmsPreviewLink,
  admCmsPreviewPanel,
  admCmsPreviewSection,
  admCmsPreviewSectionTitle,
  admCmsPublishBtn,
  admCmsSiteIframe,
  admFormCard,
  admMuted,
  admPageTitle,
} from "../admin-tw";
import { cpSection } from "@/components/counter/counter-tw";
import {
  spBtnBack,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

export function AdminCmsPreviewPanel() {
  const [bundle, setBundle] = useState<CmsSiteBundleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishResult, setPublishResult] = useState<CmsPublishResultDto | null>(null);
  const confirm = useConfirm();
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
      !(await confirm({
        title: "Publish draft CMS content?",
        description:
          "This replaces the current published content on the live site.",
        confirmLabel: "Publish",
      }))
    ) {
      return;
    }
    setPublishing(true);
    setError("");
    try {
      const res = await apiPost<CmsPublishResultDto>("/admin/cms/publish", {});
      setPublishResult(res.data);
      toast.success(
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
      <div className={cpSection}>
        <p className={admMuted}>Loading draft preview…</p>
      </div>
    );
  }

  return (
    <div className={`${cpSection} ${admCmsPreviewPanel}`.trim()}>
      <h3 className={admPageTitle}>PREVIEW &amp; PUBLISH</h3>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}

      <div className={admFormCard}>
        <p className={`${admMuted} ${admCmsHint}`}>
          <strong>Draft preview</strong> shows unpublished CMS changes from the API.{" "}
          <strong>Live site</strong> shows published content on your tenant subdomain (updates
          after you publish).
        </p>
        <div className={admCmsPreviewActions}>
          <button type="button" className={spBtnBack} onClick={load} disabled={loading}>
            Refresh draft
          </button>
          <Link href="/admin/cms/full-preview" className={`${spFilterSearch} ${admCmsPreviewLink}`}>
            Full draft preview
          </Link>
          {liveSiteUrl ? (
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${spFilterSearch} ${admCmsPreviewLink}`}
            >
              Open live site
            </a>
          ) : (
            <span className={`${admMuted} ${admCmsHint}`}>
              Set tenant cookie or use demo.lvh.me for live link
            </span>
          )}
          <button
            type="button"
            className={`${spFilterSearch} ${admCmsPublishBtn}`}
            onClick={publish}
            disabled={publishing}
          >
            {publishing ? "Publishing…" : "Publish draft to live"}
          </button>
        </div>
        {publishResult ? (
          <p className={`${admMuted} ${admCmsHint}`}>
            Last publish: {publishResult.counts.profile} profile, {publishResult.counts.theme}{" "}
            theme, {publishResult.counts.pages} pages, {publishResult.counts.media} media,{" "}
            {publishResult.counts.featuredRoutes} routes, {publishResult.counts.footer} footer.
          </p>
        ) : null}
      </div>

      {bundle ? (
        <>
          <section className={admCmsPreviewSection}>
            <h4 className={admCmsPreviewSectionTitle}>Draft (unpublished)</h4>
            <AdminCmsDraftSitePreview bundle={bundle} />
          </section>

          <div className={admCmsIframeWrap}>
            <h4 className={admCmsPreviewSectionTitle}>Live site (published)</h4>
            <p className={`${admMuted} ${admCmsHint}`}>
              iframe loads your tenant public URL — not the admin host. Publish to refresh.
            </p>
            <iframe
              title="Published public site"
              src={iframeSrc}
              className={admCmsSiteIframe}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
