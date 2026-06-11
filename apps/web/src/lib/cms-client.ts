/** Client-safe CMS helpers (no next/headers). Server fetch: cms-server.ts */

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
}

/** Resolve CMS asset or static web path to a fetchable URL. */
export function resolveCmsAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/api/")) {
    return `${getApiBaseUrl()}${trimmed}`;
  }
  return trimmed;
}
