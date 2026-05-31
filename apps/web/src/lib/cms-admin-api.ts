import type { CmsAssetUploadDto } from "@repo/shared";
import { clearAuthSession, getAuthToken } from "./auth-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Resolve CMS image URLs for display (API assets vs static /images). */
export function resolveCmsAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/")) return `${API_URL}${url}`;
  return url;
}

export async function apiUploadCmsAsset(file: File): Promise<CmsAssetUploadDto> {
  const form = new FormData();
  form.append("file", file);
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/api/v1/admin/cms/assets`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  if (res.status === 401) clearAuthSession();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "Upload failed");
  }
  return json.data as CmsAssetUploadDto;
}
