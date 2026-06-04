import { resolveTenantSlug } from "./build-api-headers";

/** Public site URL for the current tenant (subdomain on MAIN_DOMAIN). */
export function buildTenantPublicSiteUrl(): string | null {
  if (typeof window === "undefined") return null;
  const slug = resolveTenantSlug();
  if (!slug) return null;

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "lvh.me:3000";
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${mainDomain}/`;
}
