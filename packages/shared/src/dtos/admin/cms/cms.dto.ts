import { z } from "zod";
import {
  cmsFontFamilySchema,
  cmsPageSlugSchema,
  contentStatusSchema,
  siteMediaKindSchema,
} from "../../../enums/cms.js";
import {
  contactLineSchema,
  footerBarLinkSchema,
  hexColorSchema,
} from "../../../schemas/admin/cms/cms.schema.js";

export const brandPaletteSchema = z.object({
  primary: hexColorSchema,
  primaryHover: hexColorSchema,
  primaryLight: hexColorSchema,
  primaryMuted: hexColorSchema,
  accent: hexColorSchema,
  accentHover: hexColorSchema,
  surface: hexColorSchema,
  surfaceElevated: hexColorSchema,
  text: hexColorSchema,
  textMuted: hexColorSchema,
  textOnPrimary: hexColorSchema,
  border: hexColorSchema,
  success: hexColorSchema,
  danger: hexColorSchema,
  warning: hexColorSchema,
});

export const siteProfileDtoSchema = z.object({
  companyName: z.string(),
  tagline: z.string().nullable(),
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  tradeLicenseNo: z.string().nullable(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const siteThemeDtoSchema = z.object({
  primaryColor: hexColorSchema,
  fontFamily: cmsFontFamilySchema,
  palette: brandPaletteSchema,
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const contentPageDtoSchema = z.object({
  id: z.string(),
  slug: cmsPageSlugSchema,
  title: z.string(),
  bodyMarkdown: z.string(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const siteMediaDtoSchema = z.object({
  id: z.string(),
  kind: siteMediaKindSchema,
  url: z.string(),
  alt: z.string(),
  sortOrder: z.number().int(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const featuredRouteStopDtoSchema = z.object({
  city: z.string(),
  name: z.string(),
});

export const featuredRouteDtoSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  routeSlug: z.string(),
  fromStop: featuredRouteStopDtoSchema,
  toStop: featuredRouteStopDtoSchema,
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const footerSettingsDtoSchema = z.object({
  contactLines: z.array(contactLineSchema),
  email: z.string().email(),
  paymentBannerUrl: z.string().nullable(),
  barLinks: z.array(footerBarLinkSchema),
  poweredByText: z.string().nullable(),
  status: contentStatusSchema,
  updatedAt: z.string().datetime(),
});

export const cmsMediaBundleDtoSchema = z.object({
  hero: siteMediaDtoSchema.nullable(),
  featured: z.array(siteMediaDtoSchema),
  footerPayment: siteMediaDtoSchema.nullable(),
});

export const cmsSiteBundleDtoSchema = z.object({
  profile: siteProfileDtoSchema,
  theme: siteThemeDtoSchema,
  footer: footerSettingsDtoSchema,
  media: cmsMediaBundleDtoSchema,
  featuredRoutes: z.array(featuredRouteDtoSchema),
});

export const cmsPublicPageDtoSchema = z.object({
  slug: cmsPageSlugSchema,
  title: z.string(),
  bodyMarkdown: z.string(),
  updatedAt: z.string().datetime(),
});

export const cmsAssetUploadDtoSchema = z.object({
  key: z.string(),
  url: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
});

export const cmsPublishResultDtoSchema = z.object({
  publishedAt: z.string().datetime(),
  counts: z.object({
    profile: z.number().int(),
    theme: z.number().int(),
    pages: z.number().int(),
    media: z.number().int(),
    featuredRoutes: z.number().int(),
    footer: z.number().int(),
  }),
});

export type BrandPaletteDto = z.infer<typeof brandPaletteSchema>;
export type SiteProfileDto = z.infer<typeof siteProfileDtoSchema>;
export type SiteThemeDto = z.infer<typeof siteThemeDtoSchema>;
export type ContentPageDto = z.infer<typeof contentPageDtoSchema>;
export type SiteMediaDto = z.infer<typeof siteMediaDtoSchema>;
export type FeaturedRouteDto = z.infer<typeof featuredRouteDtoSchema>;
export type FooterSettingsDto = z.infer<typeof footerSettingsDtoSchema>;
export type CmsMediaBundleDto = z.infer<typeof cmsMediaBundleDtoSchema>;
export type CmsSiteBundleDto = z.infer<typeof cmsSiteBundleDtoSchema>;
export type CmsPublicPageDto = z.infer<typeof cmsPublicPageDtoSchema>;
export type CmsAssetUploadDto = z.infer<typeof cmsAssetUploadDtoSchema>;
export type CmsPublishResultDto = z.infer<typeof cmsPublishResultDtoSchema>;
