import { z } from "zod";

export const counterRefundResponseSchema = z.object({
  refunded: z.literal(true),
  refundAmount: z.number().int().positive(),
});

export type CounterRefundResponseDto = z.infer<typeof counterRefundResponseSchema>;
