"use client";

import { useState } from "react";
import { AdminCmsFeaturedRoutesPanel } from "./admin-cms-featured-routes-panel";
import { AdminCmsFooterPanel } from "./admin-cms-footer-panel";
import { AdminCmsMediaPanel } from "./admin-cms-media-panel";
import { AdminCmsPagesPanel } from "./admin-cms-pages-panel";
import { AdminCmsPreviewPanel } from "./admin-cms-preview-panel";
import { AdminCmsProfilePanel } from "./admin-cms-profile-panel";
import { AdminCmsThemePanel } from "./admin-cms-theme-panel";
import { CMS_SUB_TABS, type CmsSubTab } from "./cms-shared";

export function AdminCmsPanel() {
  const [subTab, setSubTab] = useState<CmsSubTab>("profile");

  return (
    <>
      <nav className="adm-cms-subnav" aria-label="CMS sections">
        {CMS_SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={subTab === id ? "is-active" : undefined}
            onClick={() => setSubTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {subTab === "profile" && <AdminCmsProfilePanel />}
      {subTab === "theme" && <AdminCmsThemePanel />}
      {subTab === "pages" && <AdminCmsPagesPanel />}
      {subTab === "media" && <AdminCmsMediaPanel />}
      {subTab === "featured" && <AdminCmsFeaturedRoutesPanel />}
      {subTab === "footer" && <AdminCmsFooterPanel />}
      {subTab === "preview" && <AdminCmsPreviewPanel />}
    </>
  );
}
