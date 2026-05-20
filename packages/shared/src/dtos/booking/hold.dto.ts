import { z } from "zod";

export const holdDtoSchema = z.object({
  holdId: z.string(),
  expiresAt: z.string().datetime(),
  seatLabels: z.array(z.string()),
  totalAmount: z.number().int(),
  lineItems: z.array(
    z.object({
      label: z.string(),
      seatClass: z.string(),
      price: z.number().int(),
    }),
  ),
});

export type HoldDto = z.infer<typeof holdDtoSchema>;
