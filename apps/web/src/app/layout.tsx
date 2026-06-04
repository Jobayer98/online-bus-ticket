import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_Bengali,
  Poppins,
  Roboto,
} from "next/font/google";
import { brandPaletteToCssVars, type CmsFontFamily } from "@repo/shared";
import { GlobalLoadingProvider } from "@/components/global-loading-provider";
import { SiteThemeProvider } from "@/components/site-theme-provider";
import { SiteShell } from "@/components/site-shell";
import { fetchCmsSiteBundle } from "@/lib/cms-server";
import "./globals.css";
import "./responsive.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-bengali",
});

const FONT_MAP = {
  Inter: inter,
  Roboto: roboto,
  Poppins: poppins,
  "Noto Sans Bengali": notoSansBengali,
} as const satisfies Record<CmsFontFamily, typeof inter>;

function fontForFamily(family: CmsFontFamily) {
  return FONT_MAP[family] ?? inter;
}

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await fetchCmsSiteBundle();
  const { profile } = bundle;
  return {
    title: `${profile.companyName} — Online Booking`,
    description: profile.tagline
      ? `${profile.companyName} — ${profile.tagline}`
      : "Book bus tickets online",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bundle = await fetchCmsSiteBundle();
  const themeCssVars = brandPaletteToCssVars(bundle.theme.palette);
  const activeFont = fontForFamily(bundle.theme.fontFamily);
  const fontVariables = `${inter.variable} ${roboto.variable} ${poppins.variable} ${notoSansBengali.variable}`;

  return (
    <html
      lang="en"
      className={fontVariables}
      style={themeCssVars as React.CSSProperties}
    >
      <body className={activeFont.className}>
        <SiteThemeProvider bundle={bundle}>
          <GlobalLoadingProvider>
            <SiteShell>{children}</SiteShell>
          </GlobalLoadingProvider>
        </SiteThemeProvider>
      </body>
    </html>
  );
}
