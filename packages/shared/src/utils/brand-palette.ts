/** Semantic brand tokens derived from a single admin-chosen primary color. */

export type BrandPalette = {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryMuted: string;
  accent: string;
  accentHover: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
};

const SEMANTIC_SUCCESS = "#198754";
const SEMANTIC_DANGER = "#dc3545";
const SEMANTIC_WARNING = "#ffc107";

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseHex(hex: string): Rgb {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex({ h, s, l }: Hsl): string {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (h < 60) {
    rn = c;
    gn = x;
  } else if (h < 120) {
    rn = x;
    gn = c;
  } else if (h < 180) {
    gn = c;
    bn = x;
  } else if (h < 240) {
    gn = x;
    bn = c;
  } else if (h < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(rn)}${toHex(gn)}${toHex(bn)}`.toLowerCase();
}

function adjustHsl(base: Hsl, delta: Partial<Hsl>): Hsl {
  return {
    h: (base.h + (delta.h ?? 0) + 360) % 360,
    s: clamp(base.s + (delta.s ?? 0), 0, 100),
    l: clamp(base.l + (delta.l ?? 0), 0, 100),
  };
}

/** WCAG 2.x relative luminance for sRGB hex colors. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colors (1–21). */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pick white or near-black text that meets WCAG AA (4.5:1) on the background. */
export function pickTextOnPrimary(backgroundHex: string): string {
  const white = "#ffffff";
  const black = "#1a1a2e";
  const whiteRatio = contrastRatio(white, backgroundHex);
  const blackRatio = contrastRatio(black, backgroundHex);

  // Prefer white on brand buttons whenever it clears WCAG AA.
  if (whiteRatio >= 4.5) return white;
  if (blackRatio >= 4.5) return black;

  // Primary is mid-tone — nudge toward whichever side clears AA first.
  const bg = rgbToHsl(parseHex(backgroundHex));
  for (let step = 5; step <= 50; step += 5) {
    const lighterBg = hslToHex(adjustHsl(bg, { l: step }));
    if (contrastRatio(black, lighterBg) >= 4.5) return black;
    const darkerBg = hslToHex(adjustHsl(bg, { l: -step }));
    if (contrastRatio(white, darkerBg) >= 4.5) return white;
  }

  return whiteRatio >= blackRatio ? white : black;
}

/**
 * Build a professional semantic palette from one admin-chosen primary hex.
 * Uses HSL scales for hover/muted variants and an analogous accent (+30° hue).
 */
export function generateBrandPalette(primaryHex: string): BrandPalette {
  const base = rgbToHsl(parseHex(primaryHex));
  const primary = hslToHex(base);
  const primaryHover = hslToHex(adjustHsl(base, { l: -8 }));
  const primaryLight = hslToHex(adjustHsl(base, { l: 20 }));
  const primaryMuted = hslToHex(adjustHsl(base, { l: 35, s: -40 }));
  const accentBase = adjustHsl(base, { h: 30 });
  const accent = hslToHex(accentBase);
  const accentHover = hslToHex(adjustHsl(accentBase, { l: -8 }));

  return {
    primary,
    primaryHover,
    primaryLight,
    primaryMuted,
    accent,
    accentHover,
    surface: "#f4f6f8",
    surfaceElevated: "#ffffff",
    text: "#1a1a2e",
    textMuted: "#6c757d",
    textOnPrimary: pickTextOnPrimary(primary),
    border: "#dee2e6",
    success: SEMANTIC_SUCCESS,
    danger: SEMANTIC_DANGER,
    warning: SEMANTIC_WARNING,
  };
}

/** Dark footer surfaces derived from the tenant primary (CMS theme). */
export function deriveFooterTokens(primaryHex: string): {
  footerBg: string;
  footerBarBg: string;
  footerText: string;
} {
  const base = rgbToHsl(parseHex(primaryHex));
  const footerBg = hslToHex(
    adjustHsl(base, { l: -22, s: Math.min(base.s + 5, 100) }),
  );
  const footerBarBg = hslToHex(
    adjustHsl(base, { l: -32, s: Math.min(base.s + 8, 100) }),
  );
  return {
    footerBg,
    footerBarBg,
    footerText: pickTextOnPrimary(footerBg),
  };
}

/** Map palette tokens to CSS custom property names used by the web app. */
export function brandPaletteToCssVars(palette: BrandPalette): Record<string, string> {
  const footer = deriveFooterTokens(palette.primary);

  return {
    "--primary": palette.primary,
    "--primary-hover": palette.primaryHover,
    "--primary-light": palette.primaryLight,
    "--primary-muted": palette.primaryMuted,
    "--accent": palette.accent,
    "--accent-hover": palette.accentHover,
    "--bg": palette.surface,
    "--card": palette.surfaceElevated,
    "--text": palette.text,
    "--muted": palette.textMuted,
    "--text-on-primary": pickTextOnPrimary(palette.primary),
    "--border": palette.border,
    "--success": palette.success,
    "--danger": palette.danger,
    "--warning": palette.warning,
    "--footer-bg": footer.footerBg,
    "--footer-bar-bg": footer.footerBarBg,
    "--footer-text": footer.footerText,
    "--home-green": palette.primary,
    "--home-green-light": palette.primaryLight,
    "--home-green-dark": palette.primaryHover,
    "--green-900": footer.footerBg,
    "--green-950": footer.footerBarBg,
  };
}
