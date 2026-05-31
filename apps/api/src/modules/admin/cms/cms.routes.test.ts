import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorCode } from "@repo/shared";
import { prismaMock } from "../../../test/mocks/database.js";
import { errorHandler } from "../../../middleware/error-handler.js";
import { signToken } from "../../../middleware/auth.js";
import { adminCmsRouter, publicCmsRouter } from "./cms.routes.js";

function adminApp(role = "ADMIN") {
  const token = signToken({ userId: "admin-1", role });
  const app = express();
  app.use(express.json());
  app.use("/admin/cms", adminCmsRouter);
  app.use("/cms", publicCmsRouter);
  app.use(errorHandler);
  return { app, token };
}

describe("CMS routes RBAC (E15-06…E15-14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids non-admin from admin CMS endpoints", async () => {
    const { app, token } = adminApp("USER");
    const res = await request(app)
      .get("/admin/cms/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it("allows public site without auth", async () => {
    const palette = { primary: "#2e7d32" };
    prismaMock.siteProfile.findUnique.mockResolvedValue({
      id: "default",
      companyName: "Test",
      tagline: null,
      logoUrl: null,
      faviconUrl: null,
      tradeLicenseNo: null,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.siteTheme.findUnique.mockResolvedValue({
      id: "default",
      primaryColor: "#2e7d32",
      fontFamily: "Inter",
      paletteJson: palette,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.footerSettings.findUnique.mockResolvedValue({
      id: "default",
      contactLines: [],
      email: "a@b.com",
      paymentBannerUrl: null,
      barLinks: [],
      poweredByText: null,
      status: "PUBLISHED",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.siteMedia.findMany.mockResolvedValue([]);
    prismaMock.featuredRoute.findMany.mockResolvedValue([]);

    const { app } = adminApp();
    const res = await request(app).get("/cms/site");
    expect(res.status).toBe(200);
    expect(res.body.data.profile.companyName).toBe("Test");
  });
});
