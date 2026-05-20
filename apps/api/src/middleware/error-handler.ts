import type { ErrorRequestHandler } from "express";
import { Prisma } from "@repo/database";
import { ZodError } from "zod";
import { AppError, ErrorCode, successResponse } from "@repo/shared";
import { logger } from "../lib/logger.js";

function isZodError(err: unknown): err is ZodError {
  return (
    err instanceof ZodError ||
    (typeof err === "object" &&
      err !== null &&
      (err as ZodError).name === "ZodError" &&
      Array.isArray((err as ZodError).issues))
  );
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (isZodError(err)) {
    res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Validation failed",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "Record not found",
        },
      });
      return;
    }
    if (err.code === "P2003") {
      const field = String(err.meta?.field_name ?? "");
      let message = "Invalid booking reference";
      if (field.includes("boarding_point")) {
        message =
          "Boarding point is not valid for this schedule. Go back and select boarding again.";
      } else if (field.includes("hold_id")) {
        message = "Seat hold expired. Go back and select seats again.";
      } else if (field.includes("user_id")) {
        message = "Invalid user session. Sign in again or continue as guest.";
      } else if (field.includes("schedule_seat")) {
        message =
          "Seat hold is no longer valid. Go back and select seats again.";
      } else if (field.includes("schedule_id")) {
        message = "This bus schedule is no longer available.";
      }
      res.status(400).json({
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message,
          details:
            process.env.NODE_ENV === "development"
              ? { prismaField: field }
              : undefined,
        },
      });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({
        error: {
          code: ErrorCode.CONFLICT,
          message: "Booking already exists for this hold",
        },
      });
      return;
    }
    logger.error({ err, requestId: req.requestId }, "Prisma error");
  }

  logger.error({ err, requestId: req.requestId }, "Unhandled error");
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
    },
  });
};

export { successResponse };
