import type { RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id = (req.headers["x-request-id"] as string) ?? uuidv4();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
};

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      userId?: string;
      userRole?: string;
    }
  }
}
