import {
  brandPaletteToCssVars,
  generateBrandPalette,
  type CmsSiteBundleDto,
} from "@repo/shared";

const FALLBACK_PRIMARY = "#2e7d32";
const FALLBACK_PALETTE = generateBrandPalette(FALLBACK_PRIMARY);
const FALLBACK_UPDATED = "2020-01-01T00:00:00.000Z";

/** Minimal neutral fallback when CMS API is unavailable or tenant is unknown. */
export const DEFAULT_CMS_SITE_BUNDLE: CmsSiteBundleDto = {
  profile: {
    companyName: "Bus Service",
    tagline: null,
    logoUrl: null,
    faviconUrl: null,
    tradeLicenseNo: null,
    status: "PUBLISHED",
    updatedAt: FALLBACK_UPDATED,
  },
  theme: {
    primaryColor: FALLBACK_PRIMARY,
    fontFamily: "Inter",
    palette: FALLBACK_PALETTE,
    status: "PUBLISHED",
    updatedAt: FALLBACK_UPDATED,
  },
  footer: {
    contactLines: [],
    email: "",
    paymentBannerUrl: null,
    barLinks: [
      { label: "About Us", href: "/about" },
      { label: "Return Policy", href: "/return-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
    poweredByText: "Powered by Bus Service",
    status: "PUBLISHED",
    updatedAt: FALLBACK_UPDATED,
  },
  media: {
    hero: null,
    featured: [],
    footerPayment: null,
  },
  featuredRoutes: [],
};

export function defaultThemeCssVars(): Record<string, string> {
  return brandPaletteToCssVars(FALLBACK_PALETTE);
}
