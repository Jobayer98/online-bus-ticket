import { z } from "zod";

export const channelRevenueBreakdownSchema = z.object({
  count: z.number().int(),
  grossRevenue: z.number().int(),
});

export const routeRevenueSchema = z.object({
  routeSlug: z.string(),
  count: z.number().int(),
  grossRevenue: z.number().int(),
});

export const salesReportSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  grossRevenue: z.number().int(),
  refundTotal: z.number().int().nonnegative(),
  netRevenue: z.number().int(),
  ticketCount: z.number().int(),
  refundCount: z.number().int(),
  online: channelRevenueBreakdownSchema,
  counter: channelRevenueBreakdownSchema,
  byRoute: z.array(routeRevenueSchema),
});

export type SalesReportDto = z.infer<typeof salesReportSchema>;
export type ChannelRevenueBreakdownDto = z.infer<typeof channelRevenueBreakdownSchema>;
export type RouteRevenueDto = z.infer<typeof routeRevenueSchema>;

export const analyticsOverviewSchema = z.object({
  grossRevenue30d: z.number().int(),
  refundTotal30d: z.number().int().nonnegative(),
  netRevenue30d: z.number().int(),
  ticketsSold30d: z.number().int(),
  refundCount30d: z.number().int(),
  seatsSold30d: z.number().int(),
  upcomingSchedules: z.number().int(),
  avgTicketValue: z.number().int(),
});

export type AnalyticsOverviewDto = z.infer<typeof analyticsOverviewSchema>;
