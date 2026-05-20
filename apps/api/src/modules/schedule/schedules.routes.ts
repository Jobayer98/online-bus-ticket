import { Router } from "express";
import { prisma } from "@repo/database";
import { searchSchedulesQuerySchema, successResponse } from "@repo/shared";
import * as scheduleService from "./schedules.service.js";

export const schedulesRouter = Router();

schedulesRouter.get("/stops", async (_req, res, next) => {
  try {
    const stops = await prisma.stop.findMany({ orderBy: { name: "asc" } });
    res.json(successResponse(stops));
  } catch (e) {
    next(e);
  }
});

schedulesRouter.get("/search", async (req, res, next) => {
  try {
    const query = searchSchedulesQuerySchema.parse(req.query);
    const data = await scheduleService.searchSchedules(query);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

schedulesRouter.get("/by-route/:slug", async (req, res, next) => {
  try {
    const route = await scheduleService.getRouteBySlug(req.params.slug);
    res.json(successResponse(route));
  } catch (e) {
    next(e);
  }
});

schedulesRouter.get("/:id/seat-map", async (req, res, next) => {
  try {
    const data = await scheduleService.getSeatMap(req.params.id);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
