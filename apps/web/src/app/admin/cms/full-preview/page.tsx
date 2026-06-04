"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CmsSiteBundleDto } from "@repo/shared";
import { AdminCmsDraftSitePreview } from "@/components/admin/cms/admin-cms-draft-site-preview";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet } from "@/lib/api-client";

export default function AdminCmsFullPreviewPage() {
  const [bundle, setBundle] = useState<CmsSiteBundleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useGlobalLoading(loading);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    apiGet<CmsSiteBundleDto>("/admin/cms/preview")
      .then((r) => setBundle(r.data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load draft"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="adm-cms-full-preview-page">
      <header className="adm-cms-full-preview-page__bar">
        <Link href="/admin" className="sp-btn-back">
          ← Back to admin
        </Link>
        <h1>Draft site preview</h1>
        <button type="button" className="sp-filter-search" onClick={load} disabled={loading}>
          Refresh
        </button>
      </header>
      {error ? (
        <p className="sp-panel-error" role="alert">
          {error}
        </p>
      ) : null}
      {bundle ? <AdminCmsDraftSitePreview bundle={bundle} /> : null}
    </div>
  );
}
