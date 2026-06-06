import { z } from "zod";
import {
  cmsContactIconSchema,
  cmsFontFamilySchema,
  cmsPageSlugSchema,
  siteMediaKindSchema,
} from "../../../enums/cms.js";

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color (use #RRGGBB)");

/** Absolute URL or app-relative path (CMS assets, static images). */
export const cmsAssetUrlSchema = z
  .string()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Must be an absolute URL or a path starting with /",
  });

export const cmsPageSlugParamSchema = z.object({
  slug: cmsPageSlugSchema,
});

export const cmsAssetKeyParamSchema = z.object({
  key: z.string().min(1).max(200),
});

export const cmsAssetPathParamSchema = z.object({
  tenantId: z.string().uuid(),
  fileKey: z.string().min(1).max(200),
});

export const patchSiteProfileSchema = z
  .object({
    companyName: z.string().min(1).max(120),
    tagline: z.string().max(200).nullable().optional(),
    logoUrl: cmsAssetUrlSchema.nullable().optional(),
    faviconUrl: cmsAssetUrlSchema.nullable().optional(),
    tradeLicenseNo: z.string().max(80).nullable().optional(),
  })
  .strict();

export const patchSiteThemeSchema = z
  .object({
    primaryColor: hexColorSchema,
    fontFamily: cmsFontFamilySchema,
  })
  .strict();

export const createContentPageSchema = z.object({
  slug: cmsPageSlugSchema,
  title: z.string().min(1).max(200),
  bodyMarkdown: z.string().min(1).max(100_000),
});

export const updateContentPageSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    bodyMarkdown: z.string().min(1).max(100_000).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const createSiteMediaSchema = z.object({
  kind: siteMediaKindSchema,
  url: z.string().min(1).max(500),
  alt: z.string().max(300).default(""),
  sortOrder: z.number().int().min(0).max(999),
});

export const updateSiteMediaSchema = z
  .object({
    url: z.string().min(1).max(500).optional(),
    alt: z.string().max(300).optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const reorderSiteMediaSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0).max(999),
      }),
    )
    .min(1),
});

export const createFeaturedRouteSchema = z.object({
  routeId: z.string().min(1),
  sortOrder: z.number().int().min(0).max(999),
  isVisible: z.boolean().default(true),
});

export const updateFeaturedRouteSchema = z
  .object({
    sortOrder: z.number().int().min(0).max(999).optional(),
    isVisible: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const reorderFeaturedRoutesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0).max(999),
      }),
    )
    .min(1),
});

export const contactLineSchema = z.object({
  icon: cmsContactIconSchema,
  text: z.string().min(1).max(200),
});

export const footerBarLinkSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(300),
});

export const patchFooterSettingsSchema = z
  .object({
    contactLines: z.array(contactLineSchema).min(1).max(10).optional(),
    email: z.string().email().max(200).optional(),
    paymentBannerUrl: z.string().min(1).max(500).nullable().optional(),
    barLinks: z.array(footerBarLinkSchema).min(1).max(20).optional(),
    poweredByText: z.string().max(120).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const cmsMediaIdParamSchema = z.object({
  id: z.string().min(1),
});

export const cmsFeaturedRouteIdParamSchema = z.object({
  id: z.string().min(1),
});

export type PatchSiteProfileInput = z.infer<typeof patchSiteProfileSchema>;
export type PatchSiteThemeInput = z.infer<typeof patchSiteThemeSchema>;
export type CreateContentPageInput = z.infer<typeof createContentPageSchema>;
export type UpdateContentPageInput = z.infer<typeof updateContentPageSchema>;
export type CreateSiteMediaInput = z.infer<typeof createSiteMediaSchema>;
export type UpdateSiteMediaInput = z.infer<typeof updateSiteMediaSchema>;
export type ReorderSiteMediaInput = z.infer<typeof reorderSiteMediaSchema>;
export type CreateFeaturedRouteInput = z.infer<typeof createFeaturedRouteSchema>;
export type UpdateFeaturedRouteInput = z.infer<typeof updateFeaturedRouteSchema>;
export type ReorderFeaturedRoutesInput = z.infer<
  typeof reorderFeaturedRoutesSchema
>;
export type PatchFooterSettingsInput = z.infer<typeof patchFooterSettingsSchema>;
export type ContactLineInput = z.infer<typeof contactLineSchema>;
export type FooterBarLinkInput = z.infer<typeof footerBarLinkSchema>;
