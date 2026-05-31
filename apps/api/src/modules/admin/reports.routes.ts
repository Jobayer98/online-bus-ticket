import { Router } from "express";
import {
  reportsDateRangeQuerySchema,
  successResponse,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import {
  buildSalesExportCsv,
  getAnalyticsOverview,
  getSalesReport,
} from "./reports.service.js";

export const adminReportsRouter = Router();
adminReportsRouter.use(authenticateRequired, requireRole("ADMIN"));

adminReportsRouter.get("/sales", async (req, res, next) => {
  try {
    const query = reportsDateRangeQuerySchema.parse(req.query);
    const data = await getSalesReport(query.from, query.to);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

adminReportsRouter.get("/analytics/overview", async (_req, res, next) => {
  try {
    const data = await getAnalyticsOverview();
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

adminReportsRouter.get("/export/csv", async (req, res, next) => {
  try {
    const query = reportsDateRangeQuerySchema.parse(req.query);
    const csv = await buildSalesExportCsv(query.from, query.to);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sales.csv");
    res.send(csv);
  } catch (e) {
    next(e);
  }
});
