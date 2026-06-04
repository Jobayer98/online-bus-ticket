import { prisma, type ContentStatus, type Prisma } from "@repo/database";
import type {
  CreateContentPageInput,
  CreateFeaturedRouteInput,
  CreateSiteMediaInput,
  PatchSiteProfileInput,
  PatchSiteThemeInput,
  ReorderFeaturedRoutesInput,
  ReorderSiteMediaInput,
  UpdateContentPageInput,
  UpdateFeaturedRouteInput,
  UpdateSiteMediaInput,
} from "@repo/shared";

const featuredRouteInclude = {
  route: { include: { fromStop: true, toStop: true } },
} satisfies Prisma.FeaturedRouteInclude;

// ---------------------------------------------------------------------------
// Site Profile
// ---------------------------------------------------------------------------

export async function findSiteProfile(tenantId?: string) {
  return prisma.siteProfile.findFirst({ where: { tenantId } });
}

export async function upsertSiteProfileDraft(
  input: PatchSiteProfileInput,
  tenantId?: string,
) {
  const existing = await prisma.siteProfile.findFirst({ where: { tenantId } });
  if (existing) {
    return prisma.siteProfile.update({
      where: { id: existing.id },
      data: { ...input, status: "DRAFT" },
    });
  }
  return prisma.siteProfile.create({
    data: { ...input, tenantId, status: "DRAFT" },
  });
}

// ---------------------------------------------------------------------------
// Site Theme
// ---------------------------------------------------------------------------

export async function findSiteTheme(tenantId?: string) {
  return prisma.siteTheme.findFirst({ where: { tenantId } });
}

export async function upsertSiteThemeDraft(
  input: PatchSiteThemeInput,
  paletteJson: Prisma.InputJsonValue,
  tenantId?: string,
) {
  const existing = await prisma.siteTheme.findFirst({ where: { tenantId } });
  if (existing) {
    return prisma.siteTheme.update({
      where: { id: existing.id },
      data: {
        primaryColor: input.primaryColor,
        fontFamily: input.fontFamily,
        paletteJson,
        status: "DRAFT",
      },
    });
  }
  return prisma.siteTheme.create({
    data: {
      tenantId,
      primaryColor: input.primaryColor,
      fontFamily: input.fontFamily,
      paletteJson,
      status: "DRAFT",
    },
  });
}

// ---------------------------------------------------------------------------
// Footer Settings
// ---------------------------------------------------------------------------

export async function findFooterSettings(tenantId?: string) {
  return prisma.footerSettings.findFirst({ where: { tenantId } });
}

export async function upsertFooterSettingsDraft(
  data: Prisma.FooterSettingsUpdateInput & {
    contactLines?: Prisma.InputJsonValue;
    barLinks?: Prisma.InputJsonValue;
    email?: string;
    paymentBannerUrl?: string | null;
    poweredByText?: string | null;
  },
  tenantId?: string,
) {
  const existing = await prisma.footerSettings.findFirst({ where: { tenantId } });
  if (existing) {
    return prisma.footerSettings.update({
      where: { id: existing.id },
      data: { ...data, status: "DRAFT" },
    });
  }
  return prisma.footerSettings.create({
    data: {
      tenantId,
      contactLines: (data.contactLines as Prisma.InputJsonValue) ?? [],
      email: (data.email as string) ?? "",
      paymentBannerUrl: (data.paymentBannerUrl as string | null) ?? null,
      barLinks: (data.barLinks as Prisma.InputJsonValue) ?? [],
      poweredByText: (data.poweredByText as string | null) ?? null,
      status: "DRAFT",
    },
  });
}

// ---------------------------------------------------------------------------
// Content Pages
// ---------------------------------------------------------------------------

export async function listContentPages(
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.contentPage.findMany({
    where: { status, tenantId },
    orderBy: { slug: "asc" },
  });
}

export async function findContentPageBySlug(
  slug: string,
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.contentPage.findFirst({ where: { slug, status, tenantId } });
}

export async function createContentPage(
  input: CreateContentPageInput,
  tenantId?: string,
) {
  return prisma.contentPage.create({
    data: { ...input, tenantId, status: "DRAFT" },
  });
}

export async function updateContentPage(
  id: string,
  input: UpdateContentPageInput,
  tenantId?: string,
) {
  const page = await prisma.contentPage.findFirst({ where: { id, tenantId } });
  if (!page) throw new Error("Content page not found");
  return prisma.contentPage.update({ where: { id }, data: input });
}

export async function deleteContentPage(id: string, tenantId?: string) {
  const page = await prisma.contentPage.findFirst({ where: { id, tenantId } });
  if (!page) throw new Error("Content page not found");
  return prisma.contentPage.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Site Media
// ---------------------------------------------------------------------------

export async function listSiteMedia(
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.siteMedia.findMany({
    where: { status, tenantId },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
  });
}

export async function findSiteMediaById(
  id: string,
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.siteMedia.findFirst({ where: { id, status, tenantId } });
}

export async function createSiteMedia(
  input: CreateSiteMediaInput,
  tenantId?: string,
) {
  return prisma.siteMedia.create({
    data: { ...input, tenantId, status: "DRAFT" },
  });
}

export async function updateSiteMedia(
  id: string,
  input: UpdateSiteMediaInput,
  tenantId?: string,
) {
  const media = await prisma.siteMedia.findFirst({ where: { id, tenantId } });
  if (!media) throw new Error("Site media not found");
  return prisma.siteMedia.update({ where: { id }, data: input });
}

export async function deleteSiteMedia(id: string, tenantId?: string) {
  const media = await prisma.siteMedia.findFirst({ where: { id, tenantId } });
  if (!media) throw new Error("Site media not found");
  return prisma.siteMedia.delete({ where: { id } });
}

export async function reorderSiteMediaItems(
  input: ReorderSiteMediaInput,
  _tenantId?: string,
) {
  return prisma.$transaction(
    input.items.map((item) =>
      prisma.siteMedia.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Featured Routes
// ---------------------------------------------------------------------------

export async function listFeaturedRoutes(
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.featuredRoute.findMany({
    where: { status, tenantId },
    orderBy: { sortOrder: "asc" },
    include: featuredRouteInclude,
  });
}

export async function findFeaturedRouteById(
  id: string,
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.featuredRoute.findFirst({
    where: { id, status, tenantId },
    include: featuredRouteInclude,
  });
}

export async function findFeaturedRouteByRouteId(
  routeId: string,
  status: ContentStatus,
  tenantId?: string,
) {
  return prisma.featuredRoute.findFirst({
    where: { routeId, status, tenantId },
  });
}

export async function createFeaturedRoute(
  input: CreateFeaturedRouteInput,
  tenantId?: string,
) {
  return prisma.featuredRoute.create({
    data: { ...input, tenantId, status: "DRAFT" },
    include: featuredRouteInclude,
  });
}

export async function updateFeaturedRoute(
  id: string,
  input: UpdateFeaturedRouteInput,
  tenantId?: string,
) {
  const route = await prisma.featuredRoute.findFirst({
    where: { id, tenantId },
  });
  if (!route) throw new Error("Featured route not found");
  return prisma.featuredRoute.update({
    where: { id },
    data: input,
    include: featuredRouteInclude,
  });
}

export async function deleteFeaturedRoute(id: string, tenantId?: string) {
  const route = await prisma.featuredRoute.findFirst({
    where: { id, tenantId },
  });
  if (!route) throw new Error("Featured route not found");
  return prisma.featuredRoute.delete({ where: { id } });
}

export async function reorderFeaturedRouteItems(
  input: ReorderFeaturedRoutesInput,
  _tenantId?: string,
) {
  return prisma.$transaction(
    input.items.map((item) =>
      prisma.featuredRoute.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}

export async function findRouteById(routeId: string, tenantId?: string) {
  return prisma.route.findFirst({ where: { id: routeId, tenantId } });
}

// ---------------------------------------------------------------------------
// Publish
// ---------------------------------------------------------------------------

export async function publishCmsContent(tenantId?: string) {
  const publishedAt = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.contentPage.deleteMany({ where: { status: "PUBLISHED", tenantId } });
    const pages = await tx.contentPage.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    await tx.siteMedia.deleteMany({ where: { status: "PUBLISHED", tenantId } });
    const media = await tx.siteMedia.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    await tx.featuredRoute.deleteMany({ where: { status: "PUBLISHED", tenantId } });
    const featuredRoutes = await tx.featuredRoute.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    const profile = await tx.siteProfile.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    const theme = await tx.siteTheme.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    const footer = await tx.footerSettings.updateMany({
      where: { status: "DRAFT", tenantId },
      data: { status: "PUBLISHED" },
    });

    return {
      publishedAt: publishedAt.toISOString(),
      counts: {
        profile: profile.count,
        theme: theme.count,
        pages: pages.count,
        media: media.count,
        featuredRoutes: featuredRoutes.count,
        footer: footer.count,
      },
    };
  });
}

export type FeaturedRouteWithRoute = Prisma.FeaturedRouteGetPayload<{
  include: typeof featuredRouteInclude;
}>;
