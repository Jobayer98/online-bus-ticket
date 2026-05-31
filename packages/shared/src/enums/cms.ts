import { z } from "zod";

export const ContentStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;
export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
export const contentStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const SiteMediaKind = {
  HERO: "HERO",
  FEATURED: "FEATURED",
  FOOTER_PAYMENT: "FOOTER_PAYMENT",
} as const;
export type SiteMediaKind = (typeof SiteMediaKind)[keyof typeof SiteMediaKind];
export const siteMediaKindSchema = z.enum(["HERO", "FEATURED", "FOOTER_PAYMENT"]);

export const CmsPageSlug = {
  ABOUT: "about",
  CONTACT: "contact",
  TERMS: "terms-and-conditions",
  PRIVACY: "privacy-policy",
  RETURN_POLICY: "return-policy",
} as const;
export type CmsPageSlug = (typeof CmsPageSlug)[keyof typeof CmsPageSlug];
export const cmsPageSlugSchema = z.enum([
  "about",
  "contact",
  "terms-and-conditions",
  "privacy-policy",
  "return-policy",
]);

export const CmsFontFamily = {
  INTER: "Inter",
  ROBOTO: "Roboto",
  POPPINS: "Poppins",
  NOTO_SANS_BENGALI: "Noto Sans Bengali",
} as const;
export type CmsFontFamily = (typeof CmsFontFamily)[keyof typeof CmsFontFamily];
export const cmsFontFamilySchema = z.enum([
  "Inter",
  "Roboto",
  "Poppins",
  "Noto Sans Bengali",
]);

export const CmsContactIcon = {
  PIN: "pin",
  HOME: "home",
  BUILDING: "building",
  GLOBE: "globe",
} as const;
export type CmsContactIcon =
  (typeof CmsContactIcon)[keyof typeof CmsContactIcon];
export const cmsContactIconSchema = z.enum(["pin", "home", "building", "globe"]);
