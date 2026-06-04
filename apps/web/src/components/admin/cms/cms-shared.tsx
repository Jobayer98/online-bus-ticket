"use client";

import type { CmsPageSlug } from "@repo/shared";
import { CmsPageSlug as CmsPageSlugEnum } from "@repo/shared";

export type CmsSubTab =
  | "profile"
  | "theme"
  | "pages"
  | "media"
  | "featured"
  | "footer"
  | "preview";

export const CMS_SUB_TABS: { id: CmsSubTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "theme", label: "Theme" },
  { id: "pages", label: "Pages" },
  { id: "media", label: "Media" },
  { id: "featured", label: "Featured routes" },
  { id: "footer", label: "Footer" },
  { id: "preview", label: "Preview & publish" },
];

export const CMS_PAGE_OPTIONS: { slug: CmsPageSlug; label: string; path: string }[] = [
  { slug: CmsPageSlugEnum.ABOUT, label: "About", path: "/about" },
  { slug: CmsPageSlugEnum.CONTACT, label: "Contact", path: "/contact" },
  {
    slug: CmsPageSlugEnum.TERMS,
    label: "Terms & conditions",
    path: "/terms-and-conditions",
  },
  { slug: CmsPageSlugEnum.PRIVACY, label: "Privacy policy", path: "/privacy-policy" },
  {
    slug: CmsPageSlugEnum.RETURN_POLICY,
    label: "Return policy",
    path: "/return-policy",
  },
];

export const CMS_FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Noto Sans Bengali",
] as const;

export const CMS_CONTACT_ICONS = ["pin", "home", "building", "globe"] as const;

export function slugToLabel(slug: string): string {
  return CMS_PAGE_OPTIONS.find((p) => p.slug === slug)?.label ?? slug;
}
