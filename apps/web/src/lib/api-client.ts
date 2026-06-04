import { clearAuthSession } from "./auth-session";
import { buildApiHeaders } from "./build-api-headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T, M = undefined>(
  path: string,
  options?: RequestInit,
): Promise<M extends undefined ? { data: T } : { data: T; meta: M }> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: buildApiHeaders(options?.headers),
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
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    credentials: "include",
    headers: buildApiHeaders(undefined, { json: false }),
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
