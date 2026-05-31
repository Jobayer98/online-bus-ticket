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
): Promise<{
  profile: SiteProfileDto | null;
  theme: SiteThemeDto | null;
  footer: FooterSettingsDto | null;
}> {
  const profileRow = await repo.findSiteProfile();
  const themeRow = await repo.findSiteTheme();
  const footerRow = await repo.findFooterSettings();

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

async function buildSiteBundle(mode: "preview" | "published"): Promise<CmsSiteBundleDto> {
  const status: ContentStatus = mode === "published" ? "PUBLISHED" : "DRAFT";
  const singletons = await resolveSingletonForMode(mode);

  if (!singletons.profile || !singletons.theme || !singletons.footer) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      mode === "published" ? "Site content not available" : "Site content not configured",
      404,
    );
  }

  let mediaRows = await repo.listSiteMedia(status);
  if (mode === "preview" && mediaRows.length === 0) {
    mediaRows = await repo.listSiteMedia("PUBLISHED");
  }
  const media = buildMediaBundle(mediaRows.map(mapMedia));

  let featuredRows = await repo.listFeaturedRoutes(status);
  if (mode === "preview" && featuredRows.length === 0) {
    featuredRows = await repo.listFeaturedRoutes("PUBLISHED");
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

export async function getProfile(): Promise<SiteProfileDto> {
  const row = await repo.findSiteProfile();
  if (!row) notFound("Site profile");
  return mapProfile(row);
}

export async function patchProfile(
  input: PatchSiteProfileInput,
): Promise<SiteProfileDto> {
  const row = await repo.upsertSiteProfileDraft(input);
  return mapProfile(row);
}

export async function getTheme(): Promise<SiteThemeDto> {
  const row = await repo.findSiteTheme();
  if (!row) notFound("Site theme");
  return mapTheme(row);
}

export async function patchTheme(input: PatchSiteThemeInput): Promise<SiteThemeDto> {
  const palette = generateBrandPalette(input.primaryColor);
  const row = await repo.upsertSiteThemeDraft(input, palette);
  return mapTheme(row);
}

export async function listPages(): Promise<ContentPageDto[]> {
  const rows = await repo.listContentPages("DRAFT");
  return rows.map(mapPage);
}

export async function getPage(slug: string): Promise<ContentPageDto> {
  const row = await repo.findContentPageBySlug(slug, "DRAFT");
  if (!row) notFound("Content page");
  return mapPage(row);
}

export async function createPage(
  input: CreateContentPageInput,
): Promise<ContentPageDto> {
  const existing = await repo.findContentPageBySlug(input.slug, "DRAFT");
  if (existing) conflict("Draft page already exists for this slug");
  try {
    const row = await repo.createContentPage(input);
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
): Promise<ContentPageDto> {
  let row = await repo.findContentPageBySlug(slug, "DRAFT");
  if (!row) {
    const published = await repo.findContentPageBySlug(slug, "PUBLISHED");
    if (!published) notFound("Content page");
    row = await repo.createContentPage({
      slug: published.slug as CreateContentPageInput["slug"],
      title: published.title,
      bodyMarkdown: published.bodyMarkdown,
    });
  }
  const updated = await repo.updateContentPage(row.id, input);
  return mapPage(updated);
}

export async function deletePage(slug: string): Promise<{ deleted: true }> {
  const row = await repo.findContentPageBySlug(slug, "DRAFT");
  if (!row) notFound("Content page");
  await repo.deleteContentPage(row.id);
  return { deleted: true };
}

export async function listMedia(): Promise<SiteMediaDto[]> {
  const rows = await repo.listSiteMedia("DRAFT");
  return rows.map(mapMedia);
}

export async function createMedia(
  input: CreateSiteMediaInput,
): Promise<SiteMediaDto> {
  try {
    const row = await repo.createSiteMedia(input);
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
): Promise<SiteMediaDto> {
  const row = await repo.findSiteMediaById(id, "DRAFT");
  if (!row) notFound("Site media");
  try {
    const updated = await repo.updateSiteMedia(id, input);
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

export async function deleteMedia(id: string): Promise<{ deleted: true }> {
  const row = await repo.findSiteMediaById(id, "DRAFT");
  if (!row) notFound("Site media");
  await repo.deleteSiteMedia(id);
  return { deleted: true };
}

export async function reorderMedia(
  input: ReorderSiteMediaInput,
): Promise<SiteMediaDto[]> {
  await repo.reorderSiteMediaItems(input);
  return listMedia();
}

export async function listFeaturedRoutes(): Promise<FeaturedRouteDto[]> {
  const rows = await repo.listFeaturedRoutes("DRAFT");
  return rows.map(mapFeaturedRoute);
}

export async function createFeaturedRoute(
  input: CreateFeaturedRouteInput,
): Promise<FeaturedRouteDto> {
  const route = await repo.findRouteById(input.routeId);
  if (!route) {
    throw new AppError(ErrorCode.ROUTE_NOT_FOUND, "Route not found", 404);
  }
  const duplicate = await repo.findFeaturedRouteByRouteId(
    input.routeId,
    "DRAFT",
  );
  if (duplicate) conflict("Route is already featured");
  try {
    const row = await repo.createFeaturedRoute(input);
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
): Promise<FeaturedRouteDto> {
  const row = await repo.findFeaturedRouteById(id, "DRAFT");
  if (!row) notFound("Featured route");
  const updated = await repo.updateFeaturedRoute(id, input);
  return mapFeaturedRoute(updated);
}

export async function deleteFeaturedRoute(
  id: string,
): Promise<{ deleted: true }> {
  const row = await repo.findFeaturedRouteById(id, "DRAFT");
  if (!row) notFound("Featured route");
  await repo.deleteFeaturedRoute(id);
  return { deleted: true };
}

export async function reorderFeaturedRoutes(
  input: ReorderFeaturedRoutesInput,
): Promise<FeaturedRouteDto[]> {
  await repo.reorderFeaturedRouteItems(input);
  return listFeaturedRoutes();
}

export async function getFooter(): Promise<FooterSettingsDto> {
  const row = await repo.findFooterSettings();
  if (!row) notFound("Footer settings");
  return mapFooter(row);
}

export async function patchFooter(
  input: PatchFooterSettingsInput,
): Promise<FooterSettingsDto> {
  const existing = await repo.findFooterSettings();
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
  const row = await repo.upsertFooterSettingsDraft(merged);
  return mapFooter(row);
}

export async function getPublicSite(): Promise<CmsSiteBundleDto> {
  return buildSiteBundle("published");
}

export async function getPreviewSite(): Promise<CmsSiteBundleDto> {
  return buildSiteBundle("preview");
}

export async function getPublicPage(slug: string): Promise<CmsPublicPageDto> {
  const row = await repo.findContentPageBySlug(slug, "PUBLISHED");
  if (!row) notFound("Page");
  return {
    slug: row.slug as CmsPublicPageDto["slug"],
    title: row.title,
    bodyMarkdown: row.bodyMarkdown,
    updatedAt: toIso(row.updatedAt),
  };
}

export async function publishSite(): Promise<CmsPublishResultDto> {
  return repo.publishCmsContent();
}

// Exported for unit tests
export const __test__ = {
  mapTheme,
  buildMediaBundle,
  buildSiteBundle,
};
