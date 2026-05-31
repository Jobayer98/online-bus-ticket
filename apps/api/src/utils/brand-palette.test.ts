import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  generateBrandPalette,
  pickTextOnPrimary,
  relativeLuminance,
} from "@repo/shared";

describe("generateBrandPalette", () => {
  it("derives semantic tokens from a green primary", () => {
    const palette = generateBrandPalette("#2e7d32");

    expect(palette.primary).toBe("#2e7d32");
    expect(palette.primaryHover).toMatch(/^#[0-9a-f]{6}$/);
    expect(palette.accent).toMatch(/^#[0-9a-f]{6}$/);
    expect(palette.primaryHover).not.toBe(palette.primary);
    expect(palette.surface).toBe("#f4f6f8");
    expect(palette.success).toBe("#198754");
  });

  it("rejects invalid hex input", () => {
    expect(() => generateBrandPalette("not-a-color")).toThrow(/Invalid hex/);
    expect(() => generateBrandPalette("#abc")).toThrow(/Invalid hex/);
  });

  it("ensures textOnPrimary meets WCAG AA against primary", () => {
    const primaries = ["#2e7d32", "#0d6efd", "#c62828", "#ffc107", "#6a1b9a"];

    for (const hex of primaries) {
      const palette = generateBrandPalette(hex);
      const ratio = contrastRatio(palette.textOnPrimary, palette.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#2e7d32", "#2e7d32")).toBe(1);
  });
});

describe("relativeLuminance", () => {
  it("is higher for white than mid gray", () => {
    expect(relativeLuminance("#ffffff")).toBeGreaterThan(
      relativeLuminance("#808080"),
    );
  });
});

describe("pickTextOnPrimary", () => {
  it("chooses white on dark green", () => {
    expect(pickTextOnPrimary("#1b5e20")).toBe("#ffffff");
  });

  it("chooses dark text on light yellow", () => {
    expect(pickTextOnPrimary("#fff9c4")).toBe("#1a1a2e");
  });
});
