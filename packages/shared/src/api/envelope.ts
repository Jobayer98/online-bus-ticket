import { z } from "zod";
import { ErrorCode } from "../errors/error-codes.js";

const errorCodeValues = Object.values(ErrorCode) as [string, ...string[]];

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum(errorCodeValues),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function successResponse<T>(data: T) {
  return { data };
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta) {
  return { data, meta };
}
