import { z } from "zod";

export const Role = {
  USER: "USER",
  COUNTER_SELLER: "COUNTER_SELLER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export const roleSchema = z.enum(["USER", "COUNTER_SELLER", "ADMIN"]);

export const BusType = {
  AC: "AC",
  NON_AC: "NON_AC",
} as const;
export type BusType = (typeof BusType)[keyof typeof BusType];
export const busTypeSchema = z.enum(["AC", "NON_AC"]);

export const SeatClass = {
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
  BUSINESS: "BUSINESS",
} as const;
export type SeatClass = (typeof SeatClass)[keyof typeof SeatClass];
export const seatClassSchema = z.enum(["STANDARD", "PREMIUM", "BUSINESS"]);

export const TimePeriod = {
  MORNING: "MORNING",
  NOON: "NOON",
  AFTERNOON: "AFTERNOON",
  NIGHT: "NIGHT",
} as const;
export type TimePeriod = (typeof TimePeriod)[keyof typeof TimePeriod];
export const timePeriodSchema = z.enum([
  "MORNING",
  "NOON",
  "AFTERNOON",
  "NIGHT",
]);

export const SeatStatus = {
  AVAILABLE: "AVAILABLE",
  HELD: "HELD",
  SOLD: "SOLD",
} as const;
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

export const BookingStatus = {
  DRAFT: "DRAFT",
  HELD: "HELD",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentMethod = {
  CASH: "CASH",
  ONLINE: "ONLINE",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const ScheduleStatus = {
  SCHEDULED: "SCHEDULED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type ScheduleStatus =
  (typeof ScheduleStatus)[keyof typeof ScheduleStatus];
