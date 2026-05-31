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

const SINGLETON_ID = "default";

const featuredRouteInclude = {
  route: { include: { fromStop: true, toStop: true } },
} satisfies Prisma.FeaturedRouteInclude;

export async function findSiteProfile() {
  return prisma.siteProfile.findUnique({ where: { id: SINGLETON_ID } });
}

export async function upsertSiteProfileDraft(input: PatchSiteProfileInput) {
  return prisma.siteProfile.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...input, status: "DRAFT" },
    update: { ...input, status: "DRAFT" },
  });
}

export async function findSiteTheme() {
  return prisma.siteTheme.findUnique({ where: { id: SINGLETON_ID } });
}

export async function upsertSiteThemeDraft(
  input: PatchSiteThemeInput,
  paletteJson: Prisma.InputJsonValue,
) {
  return prisma.siteTheme.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      primaryColor: input.primaryColor,
      fontFamily: input.fontFamily,
      paletteJson,
      status: "DRAFT",
    },
    update: {
      primaryColor: input.primaryColor,
      fontFamily: input.fontFamily,
      paletteJson,
      status: "DRAFT",
    },
  });
}

export async function findFooterSettings() {
  return prisma.footerSettings.findUnique({ where: { id: SINGLETON_ID } });
}

export async function upsertFooterSettingsDraft(
  data: Prisma.FooterSettingsUpdateInput & {
    contactLines?: Prisma.InputJsonValue;
    barLinks?: Prisma.InputJsonValue;
    email?: string;
    paymentBannerUrl?: string | null;
    poweredByText?: string | null;
  },
) {
  return prisma.footerSettings.upsert({
    where: { id: SINGLETON_ID },
    create: {
      id: SINGLETON_ID,
      contactLines: (data.contactLines as Prisma.InputJsonValue) ?? [],
      email: (data.email as string) ?? "",
      paymentBannerUrl: (data.paymentBannerUrl as string | null) ?? null,
      barLinks: (data.barLinks as Prisma.InputJsonValue) ?? [],
      poweredByText: (data.poweredByText as string | null) ?? null,
      status: "DRAFT",
    },
    update: { ...data, status: "DRAFT" },
  });
}

export async function listContentPages(status: ContentStatus) {
  return prisma.contentPage.findMany({
    where: { status },
    orderBy: { slug: "asc" },
  });
}

export async function findContentPageBySlug(
  slug: string,
  status: ContentStatus,
) {
  return prisma.contentPage.findFirst({ where: { slug, status } });
}

export async function createContentPage(input: CreateContentPageInput) {
  return prisma.contentPage.create({
    data: { ...input, status: "DRAFT" },
  });
}

export async function updateContentPage(id: string, input: UpdateContentPageInput) {
  return prisma.contentPage.update({ where: { id }, data: input });
}

export async function deleteContentPage(id: string) {
  return prisma.contentPage.delete({ where: { id } });
}

export async function listSiteMedia(status: ContentStatus) {
  return prisma.siteMedia.findMany({
    where: { status },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
  });
}

export async function findSiteMediaById(id: string, status: ContentStatus) {
  return prisma.siteMedia.findFirst({ where: { id, status } });
}

export async function createSiteMedia(input: CreateSiteMediaInput) {
  return prisma.siteMedia.create({
    data: { ...input, status: "DRAFT" },
  });
}

export async function updateSiteMedia(id: string, input: UpdateSiteMediaInput) {
  return prisma.siteMedia.update({ where: { id }, data: input });
}

export async function deleteSiteMedia(id: string) {
  return prisma.siteMedia.delete({ where: { id } });
}

export async function reorderSiteMediaItems(input: ReorderSiteMediaInput) {
  return prisma.$transaction(
    input.items.map((item) =>
      prisma.siteMedia.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );
}

export async function listFeaturedRoutes(status: ContentStatus) {
  return prisma.featuredRoute.findMany({
    where: { status },
    orderBy: { sortOrder: "asc" },
    include: featuredRouteInclude,
  });
}

export async function findFeaturedRouteById(id: string, status: ContentStatus) {
  return prisma.featuredRoute.findFirst({
    where: { id, status },
    include: featuredRouteInclude,
  });
}

export async function findFeaturedRouteByRouteId(
  routeId: string,
  status: ContentStatus,
) {
  return prisma.featuredRoute.findFirst({
    where: { routeId, status },
  });
}

export async function createFeaturedRoute(input: CreateFeaturedRouteInput) {
  return prisma.featuredRoute.create({
    data: { ...input, status: "DRAFT" },
    include: featuredRouteInclude,
  });
}

export async function updateFeaturedRoute(
  id: string,
  input: UpdateFeaturedRouteInput,
) {
  return prisma.featuredRoute.update({
    where: { id },
    data: input,
    include: featuredRouteInclude,
  });
}

export async function deleteFeaturedRoute(id: string) {
  return prisma.featuredRoute.delete({ where: { id } });
}

export async function reorderFeaturedRouteItems(
  input: ReorderFeaturedRoutesInput,
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

export async function findRouteById(routeId: string) {
  return prisma.route.findUnique({ where: { id: routeId } });
}

export async function publishCmsContent() {
  const publishedAt = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.contentPage.deleteMany({ where: { status: "PUBLISHED" } });
    const pages = await tx.contentPage.updateMany({
      where: { status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });

    await tx.siteMedia.deleteMany({ where: { status: "PUBLISHED" } });
    const media = await tx.siteMedia.updateMany({
      where: { status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });

    await tx.featuredRoute.deleteMany({ where: { status: "PUBLISHED" } });
    const featuredRoutes = await tx.featuredRoute.updateMany({
      where: { status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });

    const profile = await tx.siteProfile.updateMany({
      where: { status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });

    const theme = await tx.siteTheme.updateMany({
      where: { status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });

    const footer = await tx.footerSettings.updateMany({
      where: { status: "DRAFT" },
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
