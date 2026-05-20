import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ticketLookupSchema, successResponse } from "@repo/shared";
import * as ticketService from "./tickets.service.js";

export const ticketsRouter = Router();

const lookupLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
});

ticketsRouter.get("/lookup", lookupLimiter, async (req, res, next) => {
  try {
    const input = ticketLookupSchema.parse(req.query);
    const data = await ticketService.lookupTicket(input);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

ticketsRouter.get("/download", lookupLimiter, async (req, res, next) => {
  try {
    const input = ticketLookupSchema.parse(req.query);
    const html = await ticketService.ticketHtml(input);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (e) {
    next(e);
  }
});
