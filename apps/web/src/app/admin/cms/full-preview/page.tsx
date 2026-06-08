"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CmsSiteBundleDto } from "@repo/shared";
import { AdminCmsDraftSitePreview } from "@/components/admin/cms/admin-cms-draft-site-preview";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { apiGet } from "@/lib/api-client";
import {
  admCmsFullPreviewBar,
  admCmsFullPreviewPage,
} from "@/components/admin/admin-tw";
import {
  spBtnBack,
  spFilterSearch,
  spPanelError,
} from "@/components/search/search-tw";

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
    <div className={admCmsFullPreviewPage}>
      <header className={admCmsFullPreviewBar}>
        <Link href="/admin" className={spBtnBack}>
          ← Back to admin
        </Link>
        <h1>Draft site preview</h1>
        <button type="button" className={spFilterSearch} onClick={load} disabled={loading}>
          Refresh
        </button>
      </header>
      {error ? (
        <p className={spPanelError} role="alert">
          {error}
        </p>
      ) : null}
      {bundle ? <AdminCmsDraftSitePreview bundle={bundle} /> : null}
    </div>
  );
}
