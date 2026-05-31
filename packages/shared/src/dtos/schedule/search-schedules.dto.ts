import { z } from "zod";
import { scheduleCardSchema } from "./schedule-card.dto.js";

const facetCountSchema = z.number().int().nonnegative();

export const searchSchedulesFacetsSchema = z.object({
  timePeriod: z.object({
    MORNING: facetCountSchema,
    NOON: facetCountSchema,
    AFTERNOON: facetCountSchema,
    NIGHT: facetCountSchema,
  }),
  seatClass: z.object({
    STANDARD: facetCountSchema,
    PREMIUM: facetCountSchema,
    BUSINESS: facetCountSchema,
  }),
  total: facetCountSchema,
});

export const searchSchedulesMetaSchema = z.object({
  facets: searchSchedulesFacetsSchema,
});

export const searchSchedulesResponseSchema = z.object({
  data: z.array(scheduleCardSchema),
  meta: searchSchedulesMetaSchema,
});

export type SearchSchedulesFacets = z.infer<typeof searchSchedulesFacetsSchema>;
export type SearchSchedulesMeta = z.infer<typeof searchSchedulesMetaSchema>;
export type SearchSchedulesResponse = z.infer<
  typeof searchSchedulesResponseSchema
>;

export function emptySearchFacets(): SearchSchedulesFacets {
  return {
    timePeriod: { MORNING: 0, NOON: 0, AFTERNOON: 0, NIGHT: 0 },
    seatClass: { STANDARD: 0, PREMIUM: 0, BUSINESS: 0 },
    total: 0,
  };
}
