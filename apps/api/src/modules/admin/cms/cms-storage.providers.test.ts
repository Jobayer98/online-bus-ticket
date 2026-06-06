import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getCmsAssetStorage,
  hasCloudinaryEnv,
  resetCmsStorageProviders,
  resolveStorageDriver,
} from "./cms-storage.providers.js";
import { CloudinaryStorageAdapter } from "./adapters/cloudinary-storage.adapter.js";
import { LocalFsStorageAdapter } from "./adapters/local-fs-storage.adapter.js";

describe("cms-storage.providers", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    resetCmsStorageProviders();
    delete process.env.CMS_STORAGE_DRIVER;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  afterEach(() => {
    process.env = { ...envBackup };
    resetCmsStorageProviders();
  });

  it("hasCloudinaryEnv is false when creds are missing", () => {
    expect(hasCloudinaryEnv()).toBe(false);
  });

  it("hasCloudinaryEnv is true when all creds are set", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(hasCloudinaryEnv()).toBe(true);
  });

  it("resolveStorageDriver falls back to local without creds", () => {
    expect(resolveStorageDriver()).toBe("local");
  });

  it("resolveStorageDriver auto-selects cloudinary when creds exist", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(resolveStorageDriver()).toBe("cloudinary");
  });

  it("CMS_STORAGE_DRIVER=local overrides cloudinary creds", () => {
    process.env.CMS_STORAGE_DRIVER = "local";
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(resolveStorageDriver()).toBe("local");
    expect(getCmsAssetStorage()).toBeInstanceOf(LocalFsStorageAdapter);
  });

  it("CMS_STORAGE_DRIVER=cloudinary selects Cloudinary adapter", () => {
    process.env.CMS_STORAGE_DRIVER = "cloudinary";
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(getCmsAssetStorage()).toBeInstanceOf(CloudinaryStorageAdapter);
  });
});
