import type { RequestHandler } from "express";
import {
  cmsAssetPathParamSchema,
  cmsFeaturedRouteIdParamSchema,
  cmsMediaIdParamSchema,
  cmsPageSlugParamSchema,
  createContentPageSchema,
  createFeaturedRouteSchema,
  createSiteMediaSchema,
  patchFooterSettingsSchema,
  patchSiteProfileSchema,
  patchSiteThemeSchema,
  reorderFeaturedRoutesSchema,
  reorderSiteMediaSchema,
  successResponse,
  updateContentPageSchema,
  updateFeaturedRouteSchema,
  updateSiteMediaSchema,
  AppError,
  ErrorCode,
} from "@repo/shared";
import { getLocalAssetReader } from "./cms-storage.providers.js";
import * as cmsService from "./cms.service.js";

function nextify(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const uploadAsset: RequestHandler = nextify(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "File is required", 400);
  }
  const tenantId = req.tenant?.id;
  if (!tenantId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Tenant context required", 400);
  }
  const data = await cmsService.uploadAsset(tenantId, file);
  res.status(201).json(successResponse(data));
});

export const getAsset: RequestHandler = nextify(async (req, res) => {
  const { tenantId, fileKey } = cmsAssetPathParamSchema.parse(req.params);
  const asset = await getLocalAssetReader().read(tenantId, fileKey);
  if (!asset) {
    throw new AppError(ErrorCode.NOT_FOUND, "Asset not found", 404);
  }
  res.setHeader("Content-Type", asset.mimeType);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(asset.buffer);
});

export const getProfile: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.getProfile(req.tenant?.id);
  res.json(successResponse(data));
});

export const patchProfile: RequestHandler = nextify(async (req, res) => {
  const input = patchSiteProfileSchema.parse(req.body);
  const data = await cmsService.patchProfile(input, req.tenant?.id);
  res.json(successResponse(data));
});

export const getTheme: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.getTheme(req.tenant?.id);
  res.json(successResponse(data));
});

export const patchTheme: RequestHandler = nextify(async (req, res) => {
  const input = patchSiteThemeSchema.parse(req.body);
  const data = await cmsService.patchTheme(input, req.tenant?.id);
  res.json(successResponse(data));
});

export const listPages: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.listPages(req.tenant?.id);
  res.json(successResponse(data));
});

export const getPage: RequestHandler = nextify(async (req, res) => {
  const { slug } = cmsPageSlugParamSchema.parse(req.params);
  const data = await cmsService.getPage(slug, req.tenant?.id);
  res.json(successResponse(data));
});

export const createPage: RequestHandler = nextify(async (req, res) => {
  const input = createContentPageSchema.parse(req.body);
  const data = await cmsService.createPage(input, req.tenant?.id);
  res.status(201).json(successResponse(data));
});

export const updatePage: RequestHandler = nextify(async (req, res) => {
  const { slug } = cmsPageSlugParamSchema.parse(req.params);
  const input = updateContentPageSchema.parse(req.body);
  const data = await cmsService.updatePage(slug, input, req.tenant?.id);
  res.json(successResponse(data));
});

export const deletePage: RequestHandler = nextify(async (req, res) => {
  const { slug } = cmsPageSlugParamSchema.parse(req.params);
  const data = await cmsService.deletePage(slug, req.tenant?.id);
  res.json(successResponse(data));
});

export const listMedia: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.listMedia(req.tenant?.id);
  res.json(successResponse(data));
});

export const createMedia: RequestHandler = nextify(async (req, res) => {
  const input = createSiteMediaSchema.parse(req.body);
  const data = await cmsService.createMedia(input, req.tenant?.id);
  res.status(201).json(successResponse(data));
});

export const updateMedia: RequestHandler = nextify(async (req, res) => {
  const { id } = cmsMediaIdParamSchema.parse(req.params);
  const input = updateSiteMediaSchema.parse(req.body);
  const data = await cmsService.updateMedia(id, input, req.tenant?.id);
  res.json(successResponse(data));
});

export const deleteMedia: RequestHandler = nextify(async (req, res) => {
  const { id } = cmsMediaIdParamSchema.parse(req.params);
  const data = await cmsService.deleteMedia(id, req.tenant?.id);
  res.json(successResponse(data));
});

export const reorderMedia: RequestHandler = nextify(async (req, res) => {
  const input = reorderSiteMediaSchema.parse(req.body);
  const data = await cmsService.reorderMedia(input, req.tenant?.id);
  res.json(successResponse(data));
});

export const listFeaturedRoutes: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.listFeaturedRoutes(req.tenant?.id);
  res.json(successResponse(data));
});

export const createFeaturedRoute: RequestHandler = nextify(async (req, res) => {
  const input = createFeaturedRouteSchema.parse(req.body);
  const data = await cmsService.createFeaturedRoute(input, req.tenant?.id);
  res.status(201).json(successResponse(data));
});

export const updateFeaturedRoute: RequestHandler = nextify(async (req, res) => {
  const { id } = cmsFeaturedRouteIdParamSchema.parse(req.params);
  const input = updateFeaturedRouteSchema.parse(req.body);
  const data = await cmsService.updateFeaturedRoute(id, input, req.tenant?.id);
  res.json(successResponse(data));
});

export const deleteFeaturedRoute: RequestHandler = nextify(async (req, res) => {
  const { id } = cmsFeaturedRouteIdParamSchema.parse(req.params);
  const data = await cmsService.deleteFeaturedRoute(id, req.tenant?.id);
  res.json(successResponse(data));
});

export const reorderFeaturedRoutes: RequestHandler = nextify(async (req, res) => {
  const input = reorderFeaturedRoutesSchema.parse(req.body);
  const data = await cmsService.reorderFeaturedRoutes(input, req.tenant?.id);
  res.json(successResponse(data));
});

export const getFooter: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.getFooter(req.tenant?.id);
  res.json(successResponse(data));
});

export const patchFooter: RequestHandler = nextify(async (req, res) => {
  const input = patchFooterSettingsSchema.parse(req.body);
  const data = await cmsService.patchFooter(input, req.tenant?.id);
  res.json(successResponse(data));
});

export const getPublicSite: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.getPublicSite(req.tenant?.id);
  res.json(successResponse(data));
});

export const getPublicPage: RequestHandler = nextify(async (req, res) => {
  const { slug } = cmsPageSlugParamSchema.parse(req.params);
  const data = await cmsService.getPublicPage(slug, req.tenant?.id);
  res.json(successResponse(data));
});

export const getPreviewSite: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.getPreviewSite(req.tenant?.id);
  res.json(successResponse(data));
});

export const publishSite: RequestHandler = nextify(async (req, res) => {
  const data = await cmsService.publishSite(req.tenant?.id);
  res.json(successResponse(data));
});
