import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadStreamEnd, uploadStreamMock } = vi.hoisted(() => {
  const uploadStreamEnd = vi.fn();
  const uploadStreamMock = vi.fn(
    (_opts: unknown, cb: (err: null, result: unknown) => void) => {
      queueMicrotask(() => {
        cb(null, {
          secure_url:
            "https://res.cloudinary.com/demo/image/upload/v1/cms/tenant/abc-hero.jpg",
          public_id: "cms/tenant/abc-hero",
          bytes: 1234,
          format: "jpg",
        });
      });
      return { end: uploadStreamEnd };
    },
  );
  return { uploadStreamEnd, uploadStreamMock };
});

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: uploadStreamMock,
    },
  },
}));

import { CloudinaryStorageAdapter } from "./cloudinary-storage.adapter.js";

describe("CloudinaryStorageAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    process.env.CLOUDINARY_FOLDER = "cms";
  });

  it("uploads with tenant folder and returns secure_url", async () => {
    const tenantId = "00000000-0000-4100-8000-000000000001";
    const adapter = new CloudinaryStorageAdapter();
    const buffer = Buffer.from("image");

    const stored = await adapter.upload({
      tenantId,
      originalname: "hero.jpg",
      mimetype: "image/jpeg",
      size: buffer.length,
      buffer,
    });

    expect(uploadStreamMock).toHaveBeenCalledOnce();
    const [opts] = uploadStreamMock.mock.calls[0]!;
    expect(opts).toMatchObject({
      folder: `cms/${tenantId}`,
      resource_type: "image",
    });
    expect(String(opts.public_id)).not.toContain(".jpg");
    expect(uploadStreamEnd).toHaveBeenCalledWith(buffer);
    expect(stored.url).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/cms/tenant/abc-hero.jpg",
    );
    expect(stored.mimeType).toBe("image/jpeg");
    expect(stored.sizeBytes).toBe(1234);
    expect(stored.key).toMatch(/-hero\.jpg$/);
  });
});
