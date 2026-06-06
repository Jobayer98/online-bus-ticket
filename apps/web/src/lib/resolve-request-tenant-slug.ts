import { cookies, headers } from "next/headers";

/** Tenant slug from middleware header or dev cookie (localhost). */
export async function resolveRequestTenantSlug(): Promise<string | null> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-tenant-slug")?.trim();
  if (fromHeader) return fromHeader;

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get("tenant-slug")?.value?.trim();
  return fromCookie || null;
}
