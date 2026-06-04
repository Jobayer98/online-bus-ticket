import { generateBrandPalette } from "@repo/shared";
import type { Prisma } from "../generated/client/index.js";

const DEFAULT_PRIMARY_COLOR = "#2e7d32";
const DEFAULT_FONT_FAMILY = "Inter";

type CmsDb = Pick<
  Prisma.TransactionClient,
  "siteProfile" | "siteTheme" | "footerSettings"
>;

/** Minimal DRAFT CMS rows so admin preview/publish has a starting point. */
export async function seedTenantCmsDefaults(
  db: CmsDb,
  tenantId: string,
  companyName: string,
): Promise<void> {
  const palette = generateBrandPalette(DEFAULT_PRIMARY_COLOR);

  const profile = await db.siteProfile.findFirst({ where: { tenantId } });
  if (!profile) {
    await db.siteProfile.create({
      data: {
        tenantId,
        companyName,
        status: "DRAFT",
      },
    });
  }

  const theme = await db.siteTheme.findFirst({ where: { tenantId } });
  if (!theme) {
    await db.siteTheme.create({
      data: {
        tenantId,
        primaryColor: DEFAULT_PRIMARY_COLOR,
        fontFamily: DEFAULT_FONT_FAMILY,
        paletteJson: palette,
        status: "DRAFT",
      },
    });
  }

  const footer = await db.footerSettings.findFirst({ where: { tenantId } });
  if (!footer) {
    await db.footerSettings.create({
      data: {
        tenantId,
        contactLines: [],
        email: "",
        barLinks: [],
        poweredByText: `Powered by ${companyName}`,
        status: "DRAFT",
      },
    });
  }
}
