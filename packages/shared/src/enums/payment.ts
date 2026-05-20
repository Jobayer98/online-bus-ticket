import { z } from "zod";

export const paymentMethodSchema = z.enum(["CASH", "ONLINE"]);
