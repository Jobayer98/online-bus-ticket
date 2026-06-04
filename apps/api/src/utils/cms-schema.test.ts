import { describe, expect, it } from "vitest";
import {
  brandPaletteSchema,
  createContentPageSchema,
  hexColorSchema,
  patchSiteThemeSchema,
  siteProfileDtoSchema,
} from "@repo/shared";

describe("CMS Zod contracts", () => {
  it("hexColorSchema accepts valid hex and rejects invalid", () => {
    expect(hexColorSchema.parse("#2e7d32")).toBe("#2e7d32");
    expect(() => hexColorSchema.parse("2e7d32")).toThrow();
    expect(() => hexColorSchema.parse("#abc")).toThrow();
  });

  it("patchSiteThemeSchema validates font family enum", () => {
    const result = patchSiteThemeSchema.parse({
      primaryColor: "#0d6efd",
      fontFamily: "Roboto",
    });
    expect(result.fontFamily).toBe("Roboto");
    expect(() =>
      patchSiteThemeSchema.parse({
        primaryColor: "#0d6efd",
        fontFamily: "Comic Sans",
      }),
    ).toThrow();
  });

  it("createContentPageSchema accepts known slugs only", () => {
    expect(
      createContentPageSchema.parse({
        slug: "about",
        title: "About",
        bodyMarkdown: "Hello",
      }).slug,
    ).toBe("about");
    expect(() =>
      createContentPageSchema.parse({
        slug: "unknown",
        title: "X",
        bodyMarkdown: "Y",
      }),
    ).toThrow();
  });

  it("brandPaletteSchema matches generateBrandPalette output shape", () => {
    const sample = {
      primary: "#2e7d32",
      primaryHover: "#256628",
      primaryLight: "#4caf50",
      primaryMuted: "#a5d6a7",
      accent: "#2e7d6b",
      accentHover: "#256656",
      surface: "#f4f6f8",
      surfaceElevated: "#ffffff",
      text: "#1a1a2e",
      textMuted: "#6c757d",
      textOnPrimary: "#ffffff",
      border: "#dee2e6",
      success: "#198754",
      danger: "#dc3545",
      warning: "#ffc107",
    };
    expect(brandPaletteSchema.parse(sample)).toEqual(sample);
  });

  it("siteProfileDtoSchema parses response envelope field", () => {
    const dto = siteProfileDtoSchema.parse({
      companyName: "Demo Bus Company",
      tagline: null,
      logoUrl: "/images/logo/logo.png",
      faviconUrl: null,
      tradeLicenseNo: "08-032-01046",
      status: "PUBLISHED",
      updatedAt: "2026-05-31T12:00:00.000Z",
    });
    expect(dto.status).toBe("PUBLISHED");
  });
});
