import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalFsStorageAdapter } from "./local-fs-storage.adapter.js";

describe("LocalFsStorageAdapter", () => {
  let tempDir: string;
  let adapter: LocalFsStorageAdapter;
  const tenantId = "00000000-0000-4000-8000-000000000001";

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "cms-local-storage-"));
    process.env.CMS_ASSETS_DIR = tempDir;
    adapter = new LocalFsStorageAdapter();
  });

  afterEach(async () => {
    delete process.env.CMS_ASSETS_DIR;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("uploads and reads an asset round-trip", async () => {
    const buffer = Buffer.from("fake-png");
    const stored = await adapter.upload({
      tenantId,
      originalname: "hero.png",
      mimetype: "image/png",
      size: buffer.length,
      buffer,
    });

    expect(stored.url).toBe(
      `/api/v1/cms/assets/${tenantId}/${stored.key}`,
    );
    expect(stored.mimeType).toBe("image/png");
    expect(stored.sizeBytes).toBe(buffer.length);

    const read = await adapter.read(tenantId, stored.key);
    expect(read?.buffer.equals(buffer)).toBe(true);
    expect(read?.mimeType).toBe("image/png");
  });

  it("returns null when asset is missing", async () => {
    const read = await adapter.read(tenantId, "missing.png");
    expect(read).toBeNull();
  });
});
