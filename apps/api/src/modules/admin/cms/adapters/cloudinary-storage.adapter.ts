import { v2 as cloudinary } from "cloudinary";
import {
  buildAssetKey,
  stripExtension,
} from "../cms-assets.js";
import type {
  CmsAssetStorage,
  CmsAssetUploadInput,
  CmsStoredAsset,
} from "../cms-storage.ports.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
};

export class CloudinaryStorageAdapter implements CmsAssetStorage {
  private readonly folderPrefix: string;

  constructor() {
    cloudinary.config({
      cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
      api_key: requireEnv("CLOUDINARY_API_KEY"),
      api_secret: requireEnv("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    this.folderPrefix = process.env.CLOUDINARY_FOLDER?.trim() || "cms";
  }

  async upload(input: CmsAssetUploadInput): Promise<CmsStoredAsset> {
    const key = buildAssetKey(input.originalname);
    const publicId = stripExtension(key);
    const folder = `${this.folderPrefix}/${input.tenantId}`;

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }
          if (!uploadResult?.secure_url) {
            reject(new Error("Cloudinary upload returned no secure_url"));
            return;
          }
          resolve(uploadResult as CloudinaryUploadResult);
        },
      );
      stream.end(input.buffer);
    });

    return {
      key,
      url: result.secure_url,
      mimeType: input.mimetype,
      sizeBytes: result.bytes ?? input.size,
    };
  }
}
