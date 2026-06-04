import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AppError, ErrorCode } from "@repo/shared";

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

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function assetsBaseDir(): string {
  return path.resolve(CMS_ASSETS_DIR);
}

function resolveAssetPath(tenantId: string | null, key: string): string {
  const base = assetsBaseDir();
  const segments = tenantId ? [tenantId, key] : [key];
  const resolved = path.resolve(base, ...segments);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Invalid asset key", 400);
  }
  return resolved;
}

export async function ensureAssetsDir(tenantId?: string): Promise<void> {
  const dir = tenantId
    ? path.join(assetsBaseDir(), tenantId)
    : assetsBaseDir();
  await fs.mkdir(dir, { recursive: true });
}

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
export function parseAssetUrl(url: string): { tenantId: string | null; key: string } | null {
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

export async function saveAsset(
  tenantId: string,
  key: string,
  buffer: Buffer,
): Promise<void> {
  await ensureAssetsDir(tenantId);
  await fs.writeFile(resolveAssetPath(tenantId, key), buffer);
}

export async function readAsset(
  tenantId: string | null,
  key: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const attempts: { tenantId: string | null; key: string }[] = [
    { tenantId, key },
  ];
  if (tenantId) {
    attempts.push({ tenantId: null, key });
  }

  for (const attempt of attempts) {
    try {
      const filePath = resolveAssetPath(attempt.tenantId, attempt.key);
      const buffer = await fs.readFile(filePath);
      const ext = path.extname(attempt.key).toLowerCase();
      return {
        buffer,
        mimeType: MIME_BY_EXT[ext] ?? "application/octet-stream",
      };
    } catch {
      /* try next */
    }
  }
  return null;
}
