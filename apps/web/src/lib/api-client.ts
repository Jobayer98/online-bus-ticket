import { extractTenantSlugFromHost } from "@repo/shared";
import { clearAuthSession, getAuthToken } from "./auth-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getTenantSlug(): string | null {
  if (typeof window === "undefined") return null;
  const mainDomain =
    process.env.NEXT_PUBLIC_MAIN_DOMAIN ?? "localhost";
  return extractTenantSlugFromHost(window.location.host, mainDomain);
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const slug = getTenantSlug();
  if (slug) headers["x-tenant-slug"] = slug;

  if (extra) {
    const h = new Headers(extra);
    h.forEach((v, k) => {
      headers[k] = v;
    });
  }
  return headers;
}

export async function api<T, M = undefined>(
  path: string,
  options?: RequestInit,
): Promise<M extends undefined ? { data: T } : { data: T; meta: M }> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: authHeaders(options?.headers),
  });
  const json = await res.json();
  if (res.status === 401) clearAuthSession();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json;
}

export function apiGet<T, M = undefined>(path: string) {
  return api<T, M>(path);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  headers?: Record<string, string>,
) {
  return api<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export function apiPatch<T>(path: string, body: unknown) {
  return api<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string) {
  return api<T>(path, { method: "DELETE" });
}

export async function apiDownload(path: string, filename: string): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error?.message ?? "Download failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
