import { z } from "zod";
import { paymentProviderCodeSchema } from "../../enums/payment-provider.js";
import { paymentSettlementRouteSchema } from "../../enums/payment-provider.js";

export const paymentGatewayOptionSchema = z.object({
  code: paymentProviderCodeSchema,
  displayName: z.string(),
  settlementRoute: paymentSettlementRouteSchema,
});

export const listPaymentGatewaysResponseSchema = z.object({
  gateways: z.array(paymentGatewayOptionSchema),
});

export type PaymentGatewayOptionDto = z.infer<typeof paymentGatewayOptionSchema>;
export type ListPaymentGatewaysResponseDto = z.infer<
  typeof listPaymentGatewaysResponseSchema
>;
