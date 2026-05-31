import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateBrandPalette } from "@repo/shared";
import { prismaMock } from "../../../test/mocks/database.js";
import * as cmsService from "./cms.service.js";

const palette = generateBrandPalette("#2e7d32");

const publishedProfile = {
  id: "default",
  companyName: "Shahzadpur Travels",
  tagline: "TRAVELS",
  logoUrl: "/images/logo/logo.png",
  faviconUrl: null,
  tradeLicenseNo: "08-032-01046",
  status: "PUBLISHED" as const,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-31T10:00:00.000Z"),
};

const publishedTheme = {
  id: "default",
  primaryColor: "#2e7d32",
  fontFamily: "Inter",
  paletteJson: palette,
  status: "PUBLISHED" as const,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-31T10:00:00.000Z"),
};

const publishedFooter = {
  id: "default",
  contactLines: [{ icon: "pin", text: "Dawriapur Bazar" }],
  email: "info@example.com",
  paymentBannerUrl: null,
  barLinks: [{ label: "About Us", href: "/about" }],
  poweredByText: null,
  status: "PUBLISHED" as const,
  createdAt: new Date("2026-05-01T00:00:00.000Z"),
  updatedAt: new Date("2026-05-31T10:00:00.000Z"),
};

describe("cms.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("patchTheme", () => {
    it("recomputes palette on PATCH", async () => {
      const newPalette = generateBrandPalette("#0d6efd");
      prismaMock.siteTheme.upsert.mockResolvedValue({
        ...publishedTheme,
        primaryColor: "#0d6efd",
        fontFamily: "Roboto",
        paletteJson: newPalette,
        status: "DRAFT",
        updatedAt: new Date("2026-05-31T12:00:00.000Z"),
      });

      const result = await cmsService.patchTheme({
        primaryColor: "#0d6efd",
        fontFamily: "Roboto",
      });

      expect(result.primaryColor).toBe("#0d6efd");
      expect(result.fontFamily).toBe("Roboto");
      expect(result.palette.primary).toBe(newPalette.primary);
      expect(result.status).toBe("DRAFT");
      expect(prismaMock.siteTheme.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            paletteJson: newPalette,
            status: "DRAFT",
          }),
        }),
      );
    });
  });

  describe("getPublicSite vs getPreviewSite", () => {
    beforeEach(() => {
      prismaMock.siteProfile.findUnique.mockResolvedValue(publishedProfile);
      prismaMock.siteTheme.findUnique.mockResolvedValue(publishedTheme);
      prismaMock.footerSettings.findUnique.mockResolvedValue(publishedFooter);
      prismaMock.siteMedia.findMany.mockResolvedValue([]);
      prismaMock.featuredRoute.findMany.mockResolvedValue([]);
    });

    it("public site reads PUBLISHED media only", async () => {
      await cmsService.getPublicSite();
      expect(prismaMock.siteMedia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "PUBLISHED" } }),
      );
    });

    it("preview prefers DRAFT media with published fallback", async () => {
      prismaMock.siteMedia.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: "media-1",
            kind: "HERO",
            url: "/hero.jpg",
            alt: "Hero",
            sortOrder: 0,
            status: "PUBLISHED",
            createdAt: new Date(),
            updatedAt: new Date("2026-05-31T12:00:00.000Z"),
          },
        ]);

      const preview = await cmsService.getPreviewSite();
      expect(preview.media.hero?.url).toBe("/hero.jpg");
      expect(prismaMock.siteMedia.findMany).toHaveBeenCalledTimes(2);
    });

    it("public site rejects unpublished singletons", async () => {
      prismaMock.siteProfile.findUnique.mockResolvedValue({
        ...publishedProfile,
        status: "DRAFT",
      });

      await expect(cmsService.getPublicSite()).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });
  });

  describe("publishSite", () => {
    it("flips draft rows atomically", async () => {
      prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock));
      prismaMock.contentPage.deleteMany.mockResolvedValue({ count: 5 });
      prismaMock.contentPage.updateMany.mockResolvedValue({ count: 5 });
      prismaMock.siteMedia.deleteMany.mockResolvedValue({ count: 3 });
      prismaMock.siteMedia.updateMany.mockResolvedValue({ count: 3 });
      prismaMock.featuredRoute.deleteMany.mockResolvedValue({ count: 2 });
      prismaMock.featuredRoute.updateMany.mockResolvedValue({ count: 2 });
      prismaMock.siteProfile.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.siteTheme.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.footerSettings.updateMany.mockResolvedValue({ count: 1 });

      const result = await cmsService.publishSite();

      expect(result.counts).toEqual({
        profile: 1,
        theme: 1,
        pages: 5,
        media: 3,
        featuredRoutes: 2,
        footer: 1,
      });
      expect(result.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(prismaMock.contentPage.deleteMany).toHaveBeenCalledWith({
        where: { status: "PUBLISHED" },
      });
      expect(prismaMock.contentPage.updateMany).toHaveBeenCalledWith({
        where: { status: "DRAFT" },
        data: { status: "PUBLISHED" },
      });
    });
  });
});
