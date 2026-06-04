import { extractTenantSlugFromHost } from "@repo/shared";
import { getAuthToken } from "./auth-session";

const DEV_LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function readTenantSlugCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)tenant-slug=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Tenant slug from subdomain host, or dev cookie on localhost. */
export function resolveTenantSlug(): string | null {
  if (typeof window === "undefined") return null;

  const mainDomain =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "lvh.me:3000";
  const fromHost = extractTenantSlugFromHost(window.location.host, mainDomain);
  if (fromHost) return fromHost;

  const hostname = window.location.hostname;
  if (
    process.env.NODE_ENV !== "production" &&
    DEV_LOCAL_HOSTS.has(hostname)
  ) {
    return readTenantSlugCookie();
  }

  return null;
}

export type BuildApiHeadersOptions = {
  /** Set Content-Type: application/json (default true). Disable for FormData uploads. */
  json?: boolean;
};

export function buildApiHeaders(
  extra?: HeadersInit,
  options?: BuildApiHeadersOptions,
): HeadersInit {
  const headers: Record<string, string> = {};

  if (options?.json !== false) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const slug = resolveTenantSlug();
  if (slug) headers["x-tenant-slug"] = slug;

  if (extra) {
    const h = new Headers(extra);
    h.forEach((v, k) => {
      headers[k] = v;
    });
  }

  return headers;
}
