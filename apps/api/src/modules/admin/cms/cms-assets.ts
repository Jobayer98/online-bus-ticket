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

function resolveAssetPath(key: string): string {
  const base = assetsBaseDir();
  const resolved = path.resolve(base, key);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Invalid asset key", 400);
  }
  return resolved;
}

export async function ensureAssetsDir(): Promise<void> {
  await fs.mkdir(assetsBaseDir(), { recursive: true });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export function buildAssetKey(originalName: string): string {
  return `${uuidv4().slice(0, 8)}-${sanitizeFilename(originalName)}`;
}

export function assetPublicUrl(key: string): string {
  return `/api/v1/cms/assets/${key}`;
}

export async function saveAsset(key: string, buffer: Buffer): Promise<void> {
  await ensureAssetsDir();
  await fs.writeFile(resolveAssetPath(key), buffer);
}

export async function readAsset(
  key: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const filePath = resolveAssetPath(key);
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(key).toLowerCase();
    return {
      buffer,
      mimeType: MIME_BY_EXT[ext] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}
