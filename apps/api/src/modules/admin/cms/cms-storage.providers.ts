import { CloudinaryStorageAdapter } from "./adapters/cloudinary-storage.adapter.js";
import { LocalFsStorageAdapter } from "./adapters/local-fs-storage.adapter.js";
import type {
  CmsAssetReader,
  CmsAssetStorage,
  CmsStorageDriver,
} from "./cms-storage.ports.js";

export function hasCloudinaryEnv(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

export function resolveStorageDriver(): CmsStorageDriver {
  const explicit = process.env.CMS_STORAGE_DRIVER?.trim().toLowerCase();
  if (explicit === "local" || explicit === "cloudinary") {
    return explicit;
  }
  if (hasCloudinaryEnv()) {
    return "cloudinary";
  }
  return "local";
}

let storage: CmsAssetStorage | null = null;
let localReader: CmsAssetReader | null = null;

function createStorage(driver: CmsStorageDriver): CmsAssetStorage {
  if (driver === "cloudinary") {
    return new CloudinaryStorageAdapter();
  }
  return new LocalFsStorageAdapter();
}

export function getCmsAssetStorage(): CmsAssetStorage {
  if (!storage) {
    storage = createStorage(resolveStorageDriver());
  }
  return storage;
}

/** Always local filesystem — serves legacy and local-driver assets via GET proxy. */
export function getLocalAssetReader(): CmsAssetReader {
  if (!localReader) {
    localReader = new LocalFsStorageAdapter();
  }
  return localReader;
}

/** Test helper — reset lazy singletons between cases. */
export function resetCmsStorageProviders(): void {
  storage = null;
  localReader = null;
}
