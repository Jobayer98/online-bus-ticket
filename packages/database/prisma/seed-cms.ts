import { generateBrandPalette } from "@repo/shared";
import type { PrismaClient } from "../generated/client/index.js";
import {
  CMS_FEATURED_ROUTE_SLUGS,
  CMS_FOOTER,
  CMS_MEDIA,
  CMS_PAGES,
  CMS_PROFILE,
  CMS_THEME,
} from "./cms-seed-data.js";

const PUBLISHED = "PUBLISHED" as const;

export async function seedCms(prisma: PrismaClient, tenantId: string) {
  const palette = generateBrandPalette(CMS_THEME.primaryColor);

  const existingProfile = await prisma.siteProfile.findFirst({
    where: { tenantId },
  });
  if (existingProfile) {
    await prisma.siteProfile.update({
      where: { id: existingProfile.id },
      data: {
        companyName: CMS_PROFILE.companyName,
        tagline: CMS_PROFILE.tagline,
        logoUrl: CMS_PROFILE.logoUrl,
        faviconUrl: CMS_PROFILE.faviconUrl,
        tradeLicenseNo: CMS_PROFILE.tradeLicenseNo,
        status: PUBLISHED,
        tenantId,
      },
    });
  } else {
    await prisma.siteProfile.create({
      data: { ...CMS_PROFILE, tenantId, status: PUBLISHED },
    });
  }

  const existingTheme = await prisma.siteTheme.findFirst({ where: { tenantId } });
  if (existingTheme) {
    await prisma.siteTheme.update({
      where: { id: existingTheme.id },
      data: {
        primaryColor: CMS_THEME.primaryColor,
        fontFamily: CMS_THEME.fontFamily,
        paletteJson: palette,
        status: PUBLISHED,
        tenantId,
      },
    });
  } else {
    await prisma.siteTheme.create({
      data: {
        primaryColor: CMS_THEME.primaryColor,
        fontFamily: CMS_THEME.fontFamily,
        paletteJson: palette,
        tenantId,
        status: PUBLISHED,
      },
    });
  }

  const existingFooter = await prisma.footerSettings.findFirst({
    where: { tenantId },
  });
  if (existingFooter) {
    await prisma.footerSettings.update({
      where: { id: existingFooter.id },
      data: { ...CMS_FOOTER, status: PUBLISHED, tenantId },
    });
  } else {
    await prisma.footerSettings.create({
      data: { ...CMS_FOOTER, tenantId, status: PUBLISHED },
    });
  }

  for (const page of CMS_PAGES) {
    const existing = await prisma.contentPage.findFirst({
      where: { slug: page.slug, status: PUBLISHED, tenantId },
    });
    if (existing) {
      await prisma.contentPage.update({
        where: { id: existing.id },
        data: { title: page.title, bodyMarkdown: page.bodyMarkdown },
      });
    } else {
      await prisma.contentPage.create({
        data: { ...page, tenantId, status: PUBLISHED },
      });
    }
  }

  for (const item of CMS_MEDIA) {
    const existing = await prisma.siteMedia.findFirst({
      where: { kind: item.kind, sortOrder: item.sortOrder, status: PUBLISHED, tenantId },
    });
    if (existing) {
      await prisma.siteMedia.update({
        where: { id: existing.id },
        data: { url: item.url, alt: item.alt },
      });
    } else {
      await prisma.siteMedia.create({
        data: { ...item, tenantId, status: PUBLISHED },
      });
    }
  }

  let featuredCount = 0;
  for (let i = 0; i < CMS_FEATURED_ROUTE_SLUGS.length; i++) {
    const slug = CMS_FEATURED_ROUTE_SLUGS[i]!;
    const route = await prisma.route.findFirst({ where: { slug, tenantId } });
    if (!route) continue;

    const existing = await prisma.featuredRoute.findFirst({
      where: { routeId: route.id, status: PUBLISHED, tenantId },
    });
    if (existing) {
      await prisma.featuredRoute.update({
        where: { id: existing.id },
        data: { sortOrder: i, isVisible: true },
      });
    } else {
      await prisma.featuredRoute.create({
        data: { routeId: route.id, sortOrder: i, isVisible: true, tenantId, status: PUBLISHED },
      });
    }
    featuredCount++;
  }

  console.log("  CMS: profile, theme, footer, pages, media seeded (PUBLISHED)");
  console.log(`  CMS: ${featuredCount} featured route(s) linked (of ${CMS_FEATURED_ROUTE_SLUGS.length} desired slugs)`);
}
