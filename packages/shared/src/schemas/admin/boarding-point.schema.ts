import { z } from "zod";

export const createBoardingPointSchema = z.object({
  name: z.string().min(1).max(120),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateBoardingPointSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => data.name !== undefined || data.sortOrder !== undefined, {
    message: "At least one field required",
  });

export const boardingPointDtoSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  name: z.string(),
  sortOrder: z.number().int(),
});

export type CreateBoardingPointInput = z.infer<typeof createBoardingPointSchema>;
export type UpdateBoardingPointInput = z.infer<typeof updateBoardingPointSchema>;
export type BoardingPointDto = z.infer<typeof boardingPointDtoSchema>;
