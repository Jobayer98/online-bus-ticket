import { LRUCache } from "lru-cache";
import { prisma } from "@repo/database";
import type { ITenantResolver, ResolvedTenant } from "./tenant-resolver.ports.js";

const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 500;

const cache = new LRUCache<string, ResolvedTenant>({
  max: CACHE_MAX,
  ttl: CACHE_TTL_MS,
});

export class SubdomainTenantResolver implements ITenantResolver {
  async resolve(req: {
    headers: Record<string, string | string[] | undefined>;
  }): Promise<ResolvedTenant | null> {
    const slug = req.headers["x-tenant-slug"];
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return null;
    }

    const key = slug.trim().toLowerCase();
    const cached = cache.get(key);
    if (cached) return cached;

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomainPrefix: key }, { slug: key }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subdomainPrefix: true,
        customDomain: true,
        planTier: true,
        planStatus: true,
      },
    });

    if (!tenant) return null;

    const resolved: ResolvedTenant = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      subdomainPrefix: tenant.subdomainPrefix,
      customDomain: tenant.customDomain,
      planTier: tenant.planTier,
      planStatus: tenant.planStatus,
    };
    cache.set(key, resolved);
    return resolved;
  }
}

export function invalidateTenantCache(slug: string): void {
  cache.delete(slug.trim().toLowerCase());
}
