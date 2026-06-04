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

function p2002ConflictMessage(err: Prisma.PrismaClientKnownRequestError): string {
  const target = Array.isArray(err.meta?.target)
    ? (err.meta.target as string[]).join("_")
    : String(err.meta?.target ?? "");
  const model = String(err.meta?.modelName ?? "").toLowerCase();
  const key = `${model}_${target}`.toLowerCase();

  if (
    key.includes("hold_id") ||
    target.includes("hold_id") ||
    model === "booking"
  ) {
    return "Booking already exists for this hold";
  }
  if (
    target.includes("schedule_seat") ||
    target.includes("booking_id_schedule_seat") ||
    model === "bookingseat"
  ) {
    return "Seat already booked on this trip";
  }
  if (target.includes("idempotency") || model === "payment") {
    return "Payment already processed";
  }
  if (target.includes("passenger_number") || model === "ticket") {
    return "Ticket reference already exists";
  }
  if (
    model === "route" ||
    target.includes("slug") ||
    target.includes("from_stop") ||
    target.includes("to_stop")
  ) {
    if (target.includes("from_stop") || target.includes("to_stop")) {
      return "A route between these stops already exists";
    }
    return "A route with this slug already exists";
  }
  if (model === "stop" || target.includes("code")) {
    return "A stop with this code already exists";
  }
  if (model === "coach" || target.includes("coach_number")) {
    return "A coach with this number already exists";
  }
  if (model === "tenant" || target.includes("subdomain") || target.includes("custom_domain")) {
    return "Tenant slug or domain already taken";
  }
  if (target.includes("phone") || target.includes("email")) {
    return "User already registered with this phone or email";
  }
  if (model === "tenantmembership" || target.includes("tenant_id_user_id")) {
    return "User is already a member of this tenant";
  }
  if (model === "contentpage" || target.includes("content_pages")) {
    return "A page with this slug already exists";
  }
  if (model === "sitemedia" || target.includes("site_media")) {
    return "Media slot already in use";
  }
  if (model === "featuredroute" || target.includes("featured_routes")) {
    return "Route is already featured";
  }

  return "Record already exists";
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
          message: p2002ConflictMessage(err),
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
