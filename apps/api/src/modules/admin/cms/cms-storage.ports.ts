export type CmsAssetUploadInput = {
  tenantId: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type CmsStoredAsset = {
  key: string;
  /** Persisted in CMS fields — app-relative API path or absolute CDN URL. */
  url: string;
  mimeType: string;
  sizeBytes: number;
};

export interface CmsAssetStorage {
  upload(input: CmsAssetUploadInput): Promise<CmsStoredAsset>;
}

/** Local proxy serving for legacy / filesystem-backed assets. */
export interface CmsAssetReader {
  read(
    tenantId: string,
    key: string,
  ): Promise<{ buffer: Buffer; mimeType: string } | null>;
}

export type CmsStorageDriver = "local" | "cloudinary";
