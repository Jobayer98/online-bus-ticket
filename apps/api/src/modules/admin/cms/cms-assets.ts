import path from "path";
import { v4 as uuidv4 } from "uuid";

export const CMS_ASSETS_DIR =
  process.env.CMS_ASSETS_DIR ?? path.join(process.cwd(), "uploads", "cms");

export const CMS_ASSET_MAX_BYTES = Number(
  process.env.CMS_ASSET_MAX_BYTES ?? 5 * 1024 * 1024,
);

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export function buildAssetKey(originalName: string): string {
  return `${uuidv4().slice(0, 8)}-${sanitizeFilename(originalName)}`;
}

export function assetPublicUrl(tenantId: string, key: string): string {
  return `/api/v1/cms/assets/${tenantId}/${key}`;
}

/** Parse stored URL or legacy single-segment key. */
export function parseAssetUrl(
  url: string,
): { tenantId: string | null; key: string } | null {
  const prefix = "/api/v1/cms/assets/";
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  const slash = rest.indexOf("/");
  if (slash === -1) {
    return { tenantId: null, key: rest };
  }
  return {
    tenantId: rest.slice(0, slash),
    key: rest.slice(slash + 1),
  };
}

export function stripExtension(filename: string): string {
  const ext = path.extname(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
}
