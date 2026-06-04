import { Prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  generateBrandPalette,
  type BrandPaletteDto,
  type CmsAssetUploadDto,
  type CmsMediaBundleDto,
  type CmsPublicPageDto,
  type CmsPublishResultDto,
  type CmsSiteBundleDto,
  type ContactLineInput,
  type ContentPageDto,
  type CreateContentPageInput,
  type CreateFeaturedRouteInput,
  type CreateSiteMediaInput,
  type FeaturedRouteDto,
  type FooterBarLinkInput,
  type FooterSettingsDto,
  type PatchFooterSettingsInput,
  type PatchSiteProfileInput,
  type PatchSiteThemeInput,
  type ReorderFeaturedRoutesInput,
  type ReorderSiteMediaInput,
  type SiteMediaDto,
  type SiteProfileDto,
  type SiteThemeDto,
  type UpdateContentPageInput,
  type UpdateFeaturedRouteInput,
  type UpdateSiteMediaInput,
} from "@repo/shared";
import {
  assetPublicUrl,
  buildAssetKey,
  saveAsset,
} from "./cms-assets.js";
import * as repo from "./cms.repository.js";

type ContentStatus = "DRAFT" | "PUBLISHED";

function toIso(date: Date): string {
  return date.toISOString();
}

function mapProfile(row: {
  companyName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  tradeLicenseNo: string | null;
  status: ContentStatus;
  updatedAt: Date;
}): SiteProfileDto {
  return {
    companyName: row.companyName,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    tradeLicenseNo: row.tradeLicenseNo,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function mapTheme(row: {
  primaryColor: string;
  fontFamily: string;
  paletteJson: Prisma.JsonValue;
  status: ContentStatus;
  updatedAt: Date;
}): SiteThemeDto {
  return {
    primaryColor: row.primaryColor,
    fontFamily: row.fontFamily as SiteThemeDto["fontFamily"],
    palette: row.paletteJson as BrandPaletteDto,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function mapPage(row: {
  id: string;
  slug: string;
  title: string;
  bodyMarkdown: string;
  status: ContentStatus;
  updatedAt: Date;
}): ContentPageDto {
  return {
    id: row.id,
    slug: row.slug as ContentPageDto["slug"],
    title: row.title,
    bodyMarkdown: row.bodyMarkdown,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function mapMedia(row: {
  id: string;
  kind: string;
  url: string;
  alt: string;
  sortOrder: number;
  status: ContentStatus;
  updatedAt: Date;
}): SiteMediaDto {
  return {
    id: row.id,
    kind: row.kind as SiteMediaDto["kind"],
    url: row.url,
    alt: row.alt,
    sortOrder: row.sortOrder,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function mapFeaturedRoute(row: repo.FeaturedRouteWithRoute): FeaturedRouteDto {
  return {
    id: row.id,
    routeId: row.routeId,
    routeSlug: row.route.slug,
    fromStop: { city: row.route.fromStop.city, name: row.route.fromStop.name },
    toStop: { city: row.route.toStop.city, name: row.route.toStop.name },
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function mapFooter(row: {
  contactLines: Prisma.JsonValue;
  email: string;
  paymentBannerUrl: string | null;
  barLinks: Prisma.JsonValue;
  poweredByText: string | null;
  status: ContentStatus;
  updatedAt: Date;
}): FooterSettingsDto {
  return {
    contactLines: row.contactLines as ContactLineInput[],
    email: row.email,
    paymentBannerUrl: row.paymentBannerUrl,
    barLinks: row.barLinks as FooterBarLinkInput[],
    poweredByText: row.poweredByText,
    status: row.status,
    updatedAt: toIso(row.updatedAt),
  };
}

function buildMediaBundle(items: SiteMediaDto[]): CmsMediaBundleDto {
  const hero = items.find((m) => m.kind === "HERO") ?? null;
  const featured = items
    .filter((m) => m.kind === "FEATURED")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const footerPayment =
    items.find((m) => m.kind === "FOOTER_PAYMENT") ?? null;
  return { hero, featured, footerPayment };
}

async function resolveSingletonForMode(
  mode: "preview" | "published",
  tenantId?: string,
): Promise<{
  profile: SiteProfileDto | null;
  theme: SiteThemeDto | null;
  footer: FooterSettingsDto | null;
}> {
  const profileRow = await repo.findSiteProfile(tenantId);
  const themeRow = await repo.findSiteTheme(tenantId);
  const footerRow = await repo.findFooterSettings(tenantId);

  const pick = <T extends { status: ContentStatus }>(
    row: T | null,
  ): T | null => {
    if (!row) return null;
    if (mode === "published") {
      return row.status === "PUBLISHED" ? row : null;
    }
    if (row.status === "DRAFT") return row;
    return row.status === "PUBLISHED" ? row : null;
  };

  const profile = pick(profileRow);
  const theme = pick(themeRow);
  const footer = pick(footerRow);

  return {
    profile: profile ? mapProfile(profile) : null,
    theme: theme ? mapTheme(theme) : null,
    footer: footer ? mapFooter(footer) : null,
  };
}

async function buildSiteBundle(
  mode: "preview" | "published",
  tenantId?: string,
): Promise<CmsSiteBundleDto> {
  const status: ContentStatus = mode === "published" ? "PUBLISHED" : "DRAFT";
  const singletons = await resolveSingletonForMode(mode, tenantId);

  if (!singletons.profile || !singletons.theme || !singletons.footer) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      mode === "published" ? "Site content not available" : "Site content not configured",
      404,
    );
  }

  let mediaRows = await repo.listSiteMedia(status, tenantId);
  if (mode === "preview" && mediaRows.length === 0) {
    mediaRows = await repo.listSiteMedia("PUBLISHED", tenantId);
  }
  const media = buildMediaBundle(mediaRows.map(mapMedia));

  let featuredRows = await repo.listFeaturedRoutes(status, tenantId);
  if (mode === "preview" && featuredRows.length === 0) {
    featuredRows = await repo.listFeaturedRoutes("PUBLISHED", tenantId);
  }
  const featuredRoutes = featuredRows.map(mapFeaturedRoute);

  return {
    profile: singletons.profile,
    theme: singletons.theme,
    footer: singletons.footer,
    media,
    featuredRoutes,
  };
}

function notFound(entity: string): never {
  throw new AppError(ErrorCode.NOT_FOUND, `${entity} not found`, 404);
}

function conflict(message: string): never {
  throw new AppError(ErrorCode.CONFLICT, message, 409);
}

export async function uploadAsset(file: {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}): Promise<CmsAssetUploadDto> {
  const key = buildAssetKey(file.originalname);
  await saveAsset(key, file.buffer);
  return {
    key,
    url: assetPublicUrl(key),
    mimeType: file.mimetype,
    sizeBytes: file.size,
  };
}

export async function getProfile(tenantId?: string): Promise<SiteProfileDto> {
  const row = await repo.findSiteProfile(tenantId);
  if (!row) notFound("Site profile");
  return mapProfile(row);
}

export async function patchProfile(
  input: PatchSiteProfileInput,
  tenantId?: string,
): Promise<SiteProfileDto> {
  const row = await repo.upsertSiteProfileDraft(input, tenantId);
  return mapProfile(row);
}

export async function getTheme(tenantId?: string): Promise<SiteThemeDto> {
  const row = await repo.findSiteTheme(tenantId);
  if (!row) notFound("Site theme");
  return mapTheme(row);
}

export async function patchTheme(
  input: PatchSiteThemeInput,
  tenantId?: string,
): Promise<SiteThemeDto> {
  const palette = generateBrandPalette(input.primaryColor);
  const row = await repo.upsertSiteThemeDraft(input, palette, tenantId);
  return mapTheme(row);
}

export async function listPages(tenantId?: string): Promise<ContentPageDto[]> {
  const rows = await repo.listContentPages("DRAFT", tenantId);
  return rows.map(mapPage);
}

export async function getPage(
  slug: string,
  tenantId?: string,
): Promise<ContentPageDto> {
  const row = await repo.findContentPageBySlug(slug, "DRAFT", tenantId);
  if (!row) notFound("Content page");
  return mapPage(row);
}

export async function createPage(
  input: CreateContentPageInput,
  tenantId?: string,
): Promise<ContentPageDto> {
  const existing = await repo.findContentPageBySlug(
    input.slug,
    "DRAFT",
    tenantId,
  );
  if (existing) conflict("Draft page already exists for this slug");
  try {
    const row = await repo.createContentPage(input, tenantId);
    return mapPage(row);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      conflict("Page already exists for this slug");
    }
    throw err;
  }
}

export async function updatePage(
  slug: string,
  input: UpdateContentPageInput,
  tenantId?: string,
): Promise<ContentPageDto> {
  let row = await repo.findContentPageBySlug(slug, "DRAFT", tenantId);
  if (!row) {
    const published = await repo.findContentPageBySlug(
      slug,
      "PUBLISHED",
      tenantId,
    );
    if (!published) notFound("Content page");
    row = await repo.createContentPage(
      {
        slug: published.slug as CreateContentPageInput["slug"],
        title: published.title,
        bodyMarkdown: published.bodyMarkdown,
      },
      tenantId,
    );
  }
  const updated = await repo.updateContentPage(row.id, input, tenantId);
  return mapPage(updated);
}

export async function deletePage(
  slug: string,
  tenantId?: string,
): Promise<{ deleted: true }> {
  const row = await repo.findContentPageBySlug(slug, "DRAFT", tenantId);
  if (!row) notFound("Content page");
  await repo.deleteContentPage(row.id, tenantId);
  return { deleted: true };
}

export async function listMedia(tenantId?: string): Promise<SiteMediaDto[]> {
  const rows = await repo.listSiteMedia("DRAFT", tenantId);
  return rows.map(mapMedia);
}

export async function createMedia(
  input: CreateSiteMediaInput,
  tenantId?: string,
): Promise<SiteMediaDto> {
  try {
    const row = await repo.createSiteMedia(input, tenantId);
    return mapMedia(row);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      conflict("Media sort order already used for this kind");
    }
    throw err;
  }
}

export async function updateMedia(
  id: string,
  input: UpdateSiteMediaInput,
  tenantId?: string,
): Promise<SiteMediaDto> {
  const row = await repo.findSiteMediaById(id, "DRAFT", tenantId);
  if (!row) notFound("Site media");
  try {
    const updated = await repo.updateSiteMedia(id, input, tenantId);
    return mapMedia(updated);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      conflict("Media sort order already used for this kind");
    }
    throw err;
  }
}

export async function deleteMedia(
  id: string,
  tenantId?: string,
): Promise<{ deleted: true }> {
  const row = await repo.findSiteMediaById(id, "DRAFT", tenantId);
  if (!row) notFound("Site media");
  await repo.deleteSiteMedia(id, tenantId);
  return { deleted: true };
}

export async function reorderMedia(
  input: ReorderSiteMediaInput,
  tenantId?: string,
): Promise<SiteMediaDto[]> {
  await repo.reorderSiteMediaItems(input, tenantId);
  return listMedia(tenantId);
}

export async function listFeaturedRoutes(
  tenantId?: string,
): Promise<FeaturedRouteDto[]> {
  const rows = await repo.listFeaturedRoutes("DRAFT", tenantId);
  return rows.map(mapFeaturedRoute);
}

export async function createFeaturedRoute(
  input: CreateFeaturedRouteInput,
  tenantId?: string,
): Promise<FeaturedRouteDto> {
  const route = await repo.findRouteById(input.routeId, tenantId);
  if (!route) {
    throw new AppError(ErrorCode.ROUTE_NOT_FOUND, "Route not found", 404);
  }
  const duplicate = await repo.findFeaturedRouteByRouteId(
    input.routeId,
    "DRAFT",
    tenantId,
  );
  if (duplicate) conflict("Route is already featured");
  try {
    const row = await repo.createFeaturedRoute(input, tenantId);
    return mapFeaturedRoute(row);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      conflict("Route is already featured");
    }
    throw err;
  }
}

export async function updateFeaturedRoute(
  id: string,
  input: UpdateFeaturedRouteInput,
  tenantId?: string,
): Promise<FeaturedRouteDto> {
  const row = await repo.findFeaturedRouteById(id, "DRAFT", tenantId);
  if (!row) notFound("Featured route");
  const updated = await repo.updateFeaturedRoute(id, input, tenantId);
  return mapFeaturedRoute(updated);
}

export async function deleteFeaturedRoute(
  id: string,
  tenantId?: string,
): Promise<{ deleted: true }> {
  const row = await repo.findFeaturedRouteById(id, "DRAFT", tenantId);
  if (!row) notFound("Featured route");
  await repo.deleteFeaturedRoute(id, tenantId);
  return { deleted: true };
}

export async function reorderFeaturedRoutes(
  input: ReorderFeaturedRoutesInput,
  tenantId?: string,
): Promise<FeaturedRouteDto[]> {
  await repo.reorderFeaturedRouteItems(input, tenantId);
  return listFeaturedRoutes(tenantId);
}

export async function getFooter(tenantId?: string): Promise<FooterSettingsDto> {
  const row = await repo.findFooterSettings(tenantId);
  if (!row) notFound("Footer settings");
  return mapFooter(row);
}

export async function patchFooter(
  input: PatchFooterSettingsInput,
  tenantId?: string,
): Promise<FooterSettingsDto> {
  const existing = await repo.findFooterSettings(tenantId);
  const merged = {
    contactLines: input.contactLines ?? existing?.contactLines ?? [],
    email: input.email ?? existing?.email ?? "",
    paymentBannerUrl:
      input.paymentBannerUrl !== undefined
        ? input.paymentBannerUrl
        : (existing?.paymentBannerUrl ?? null),
    barLinks: input.barLinks ?? existing?.barLinks ?? [],
    poweredByText:
      input.poweredByText !== undefined
        ? input.poweredByText
        : (existing?.poweredByText ?? null),
  };
  const row = await repo.upsertFooterSettingsDraft(merged, tenantId);
  return mapFooter(row);
}

export async function getPublicSite(
  tenantId?: string,
): Promise<CmsSiteBundleDto> {
  return buildSiteBundle("published", tenantId);
}

export async function getPreviewSite(
  tenantId?: string,
): Promise<CmsSiteBundleDto> {
  return buildSiteBundle("preview", tenantId);
}

export async function getPublicPage(
  slug: string,
  tenantId?: string,
): Promise<CmsPublicPageDto> {
  const row = await repo.findContentPageBySlug(slug, "PUBLISHED", tenantId);
  if (!row) notFound("Page");
  return {
    slug: row.slug as CmsPublicPageDto["slug"],
    title: row.title,
    bodyMarkdown: row.bodyMarkdown,
    updatedAt: toIso(row.updatedAt),
  };
}

export async function publishSite(
  tenantId?: string,
): Promise<CmsPublishResultDto> {
  return repo.publishCmsContent(tenantId);
}

// Exported for unit tests
export const __test__ = { mapTheme, buildMediaBundle, buildSiteBundle };
