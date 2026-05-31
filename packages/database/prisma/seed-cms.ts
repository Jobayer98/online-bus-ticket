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

export async function seedCms(prisma: PrismaClient) {
  const palette = generateBrandPalette(CMS_THEME.primaryColor);

  await prisma.siteProfile.upsert({
    where: { id: "default" },
    update: {
      companyName: CMS_PROFILE.companyName,
      tagline: CMS_PROFILE.tagline,
      logoUrl: CMS_PROFILE.logoUrl,
      faviconUrl: CMS_PROFILE.faviconUrl,
      tradeLicenseNo: CMS_PROFILE.tradeLicenseNo,
      status: PUBLISHED,
    },
    create: {
      id: "default",
      ...CMS_PROFILE,
      status: PUBLISHED,
    },
  });

  await prisma.siteTheme.upsert({
    where: { id: "default" },
    update: {
      primaryColor: CMS_THEME.primaryColor,
      fontFamily: CMS_THEME.fontFamily,
      paletteJson: palette,
      status: PUBLISHED,
    },
    create: {
      id: "default",
      primaryColor: CMS_THEME.primaryColor,
      fontFamily: CMS_THEME.fontFamily,
      paletteJson: palette,
      status: PUBLISHED,
    },
  });

  await prisma.footerSettings.upsert({
    where: { id: "default" },
    update: {
      contactLines: CMS_FOOTER.contactLines,
      email: CMS_FOOTER.email,
      paymentBannerUrl: CMS_FOOTER.paymentBannerUrl,
      barLinks: CMS_FOOTER.barLinks,
      poweredByText: CMS_FOOTER.poweredByText,
      status: PUBLISHED,
    },
    create: {
      id: "default",
      ...CMS_FOOTER,
      status: PUBLISHED,
    },
  });

  for (const page of CMS_PAGES) {
    const existing = await prisma.contentPage.findFirst({
      where: { slug: page.slug, status: PUBLISHED },
    });
    if (existing) {
      await prisma.contentPage.update({
        where: { id: existing.id },
        data: { title: page.title, bodyMarkdown: page.bodyMarkdown },
      });
    } else {
      await prisma.contentPage.create({
        data: { ...page, status: PUBLISHED },
      });
    }
  }

  for (const item of CMS_MEDIA) {
    const existing = await prisma.siteMedia.findFirst({
      where: {
        kind: item.kind,
        sortOrder: item.sortOrder,
        status: PUBLISHED,
      },
    });
    if (existing) {
      await prisma.siteMedia.update({
        where: { id: existing.id },
        data: { url: item.url, alt: item.alt },
      });
    } else {
      await prisma.siteMedia.create({
        data: { ...item, status: PUBLISHED },
      });
    }
  }

  let featuredCount = 0;
  for (let i = 0; i < CMS_FEATURED_ROUTE_SLUGS.length; i++) {
    const slug = CMS_FEATURED_ROUTE_SLUGS[i]!;
    const route = await prisma.route.findUnique({ where: { slug } });
    if (!route) continue;

    const existing = await prisma.featuredRoute.findFirst({
      where: { routeId: route.id, status: PUBLISHED },
    });
    if (existing) {
      await prisma.featuredRoute.update({
        where: { id: existing.id },
        data: { sortOrder: i, isVisible: true },
      });
    } else {
      await prisma.featuredRoute.create({
        data: {
          routeId: route.id,
          sortOrder: i,
          isVisible: true,
          status: PUBLISHED,
        },
      });
    }
    featuredCount++;
  }

  console.log("  CMS: profile, theme, footer, pages, media seeded (PUBLISHED)");
  console.log(`  CMS: ${featuredCount} featured route(s) linked (of ${CMS_FEATURED_ROUTE_SLUGS.length} desired slugs)`);
}
