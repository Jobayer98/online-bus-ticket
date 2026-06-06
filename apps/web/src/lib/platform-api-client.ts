import {
  clearPlatformAuthSession,
  getPlatformAuthToken,
} from "./platform-auth-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function platformHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getPlatformAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (extra) {
    const h = new Headers(extra);
    h.forEach((v, k) => {
      headers[k] = v;
    });
  }
  return headers;
}

export async function platformApi<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T; meta?: { page: number; pageSize: number; total: number } }> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: platformHeaders(options?.headers),
  });
  const json = await res.json();
  if (res.status === 401) clearPlatformAuthSession();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json;
}

export function platformApiGet<T>(path: string) {
  return platformApi<T>(path);
}

export function platformApiPost<T>(path: string, body: unknown) {
  return platformApi<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function platformApiPatch<T>(path: string, body: unknown) {
  return platformApi<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function platformApiDownload(
  path: string,
  filename: string,
): Promise<void> {
  const token = getPlatformAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    credentials: "include",
    headers,
  });
  if (res.status === 401) clearPlatformAuthSession();
  if (!res.ok) {
    let message = "Download failed";
    try {
      const json = await res.json();
      message = json?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
