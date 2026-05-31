import { vi } from "vitest";

export const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  stop: {
    findMany: vi.fn(),
  },
  booking: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  bookingSeat: {
    count: vi.fn(),
  },
  seatHold: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  schedule: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  scheduleSeat: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
    createMany: vi.fn(),
    count: vi.fn(),
  },
  route: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  boardingPoint: {
    findFirst: vi.fn(),
  },
  coach: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  seatLayout: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  payment: {
    update: vi.fn(),
  },
  counterTransaction: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  notificationLog: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  rescheduleLog: {
    create: vi.fn(),
  },
  $transaction: vi.fn((fn: (tx: typeof prismaMock) => unknown) =>
    fn(prismaMock),
  ),
};

vi.mock("@repo/database", () => ({
  prisma: prismaMock,
}));
