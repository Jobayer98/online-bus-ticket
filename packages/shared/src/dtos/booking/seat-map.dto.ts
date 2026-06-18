import { z } from "zod";
import { seatClassSchema } from "../../enums/index.js";

export const seatMapSeatSchema = z.object({
  label: z.string(),
  row: z.number(),
  col: z.number(),
  seatClass: seatClassSchema,
  status: z.enum(["AVAILABLE", "HELD", "SOLD"]),
  price: z.number().int(),
  passengerGender: z.string().nullable().optional(),
});

export const seatMapDtoSchema = z.object({
  scheduleId: z.string(),
  rows: z.number(),
  cols: z.number(),
  seats: z.array(seatMapSeatSchema),
  boardingPoints: z.array(
    z.object({ id: z.string(), name: z.string(), sortOrder: z.number() }),
  ),
});

export type SeatMapDto = z.infer<typeof seatMapDtoSchema>;
