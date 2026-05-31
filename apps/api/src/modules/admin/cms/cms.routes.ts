import { Router } from "express";
import multer from "multer";
import { AppError, ErrorCode } from "@repo/shared";
import { authenticateRequired, requireRole } from "../../../middleware/auth.js";
import {
  ALLOWED_IMAGE_MIMES,
  CMS_ASSET_MAX_BYTES,
} from "./cms-assets.js";
import * as controller from "./cms.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CMS_ASSET_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(
      new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF"),
    );
  },
});

function uploadSingleAsset(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            `File too large (max ${CMS_ASSET_MAX_BYTES} bytes)`,
            400,
          ),
        );
        return;
      }
      next(new AppError(ErrorCode.VALIDATION_ERROR, err.message, 400));
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err) {
      next(new AppError(ErrorCode.VALIDATION_ERROR, err.message, 400));
      return;
    }
    next();
  });
}

export const adminCmsRouter = Router();
adminCmsRouter.use(authenticateRequired, requireRole("ADMIN"));

adminCmsRouter.post(
  "/assets",
  uploadSingleAsset,
  controller.uploadAsset,
);
adminCmsRouter.get("/profile", controller.getProfile);
adminCmsRouter.patch("/profile", controller.patchProfile);
adminCmsRouter.get("/theme", controller.getTheme);
adminCmsRouter.patch("/theme", controller.patchTheme);
adminCmsRouter.get("/pages", controller.listPages);
adminCmsRouter.post("/pages", controller.createPage);
adminCmsRouter.get("/pages/:slug", controller.getPage);
adminCmsRouter.patch("/pages/:slug", controller.updatePage);
adminCmsRouter.delete("/pages/:slug", controller.deletePage);
adminCmsRouter.get("/media", controller.listMedia);
adminCmsRouter.post("/media/reorder", controller.reorderMedia);
adminCmsRouter.post("/media", controller.createMedia);
adminCmsRouter.patch("/media/:id", controller.updateMedia);
adminCmsRouter.delete("/media/:id", controller.deleteMedia);
adminCmsRouter.get("/featured-routes", controller.listFeaturedRoutes);
adminCmsRouter.post(
  "/featured-routes/reorder",
  controller.reorderFeaturedRoutes,
);
adminCmsRouter.post("/featured-routes", controller.createFeaturedRoute);
adminCmsRouter.patch("/featured-routes/:id", controller.updateFeaturedRoute);
adminCmsRouter.delete("/featured-routes/:id", controller.deleteFeaturedRoute);
adminCmsRouter.get("/footer", controller.getFooter);
adminCmsRouter.patch("/footer", controller.patchFooter);
adminCmsRouter.get("/preview", controller.getPreviewSite);
adminCmsRouter.post("/publish", controller.publishSite);

export const publicCmsRouter = Router();
publicCmsRouter.get("/assets/:key", controller.getAsset);
publicCmsRouter.get("/site", controller.getPublicSite);
publicCmsRouter.get("/pages/:slug", controller.getPublicPage);
