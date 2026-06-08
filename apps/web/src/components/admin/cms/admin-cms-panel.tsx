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
import { admCmsSubnav, admCmsSubnavBtn, admCmsSubnavBtnActive } from "../admin-tw";

export function AdminCmsPanel() {
  const [subTab, setSubTab] = useState<CmsSubTab>("profile");

  return (
    <>
      <nav className={admCmsSubnav} aria-label="CMS sections">
        {CMS_SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={
              subTab === id
                ? `${admCmsSubnavBtn} ${admCmsSubnavBtnActive}`
                : admCmsSubnavBtn
            }
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
