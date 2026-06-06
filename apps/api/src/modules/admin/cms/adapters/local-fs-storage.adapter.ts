import fs from "fs/promises";
import path from "path";
import { AppError, ErrorCode } from "@repo/shared";
import {
  assetPublicUrl,
  buildAssetKey,
  CMS_ASSETS_DIR,
} from "../cms-assets.js";
import type {
  CmsAssetReader,
  CmsAssetStorage,
  CmsAssetUploadInput,
  CmsStoredAsset,
} from "../cms-storage.ports.js";

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

async function ensureAssetsDir(tenantId?: string): Promise<void> {
  const dir = tenantId
    ? path.join(assetsBaseDir(), tenantId)
    : assetsBaseDir();
  await fs.mkdir(dir, { recursive: true });
}

export class LocalFsStorageAdapter implements CmsAssetStorage, CmsAssetReader {
  async upload(input: CmsAssetUploadInput): Promise<CmsStoredAsset> {
    const key = buildAssetKey(input.originalname);
    await ensureAssetsDir(input.tenantId);
    await fs.writeFile(
      resolveAssetPath(input.tenantId, key),
      input.buffer,
    );
    return {
      key,
      url: assetPublicUrl(input.tenantId, key),
      mimeType: input.mimetype,
      sizeBytes: input.size,
    };
  }

  async read(
    tenantId: string,
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
}
