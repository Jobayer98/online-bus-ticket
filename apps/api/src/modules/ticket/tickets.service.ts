import { prisma } from "@repo/database";
import { AppError, ErrorCode, type TicketLookupInput } from "@repo/shared";
import type { DbClient } from "../../lib/db-client.js";

export type IssuedTicket = {
  id: string;
  passengerNumber: string;
};

function generatePassengerNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `P${n}`;
}

export async function issueTicketWithClient(db: DbClient, bookingId: string) {
  const existing = await db.ticket.findUnique({ where: { bookingId } });
  if (existing) return existing;

  let passengerNumber = generatePassengerNumber();
  for (let i = 0; i < 5; i++) {
    const clash = await db.ticket.findUnique({ where: { passengerNumber } });
    if (!clash) break;
    passengerNumber = generatePassengerNumber();
  }

  return db.ticket.create({
    data: {
      bookingId,
      passengerNumber,
      qrPayload: JSON.stringify({ bookingId, passengerNumber }),
    },
  });
}

export async function issueTicket(bookingId: string) {
  return issueTicketWithClient(prisma, bookingId);
}

export function toIssuedTicket(ticket: {
  id: string;
  passengerNumber: string;
}): IssuedTicket {
  return { id: ticket.id, passengerNumber: ticket.passengerNumber };
}

export async function lookupTicket(input: TicketLookupInput) {
  const ticket = await prisma.ticket.findUnique({
    where: { passengerNumber: input.passengerNumber },
    include: {
      booking: {
        include: {
          boardingPoint: true,
          schedule: { include: { route: true } },
          seats: { include: { scheduleSeat: true } },
        },
      },
    },
  });
  if (!ticket || ticket.booking.passengerPhone !== input.phone) {
    throw new AppError(ErrorCode.TICKET_NOT_FOUND, "Ticket not found", 404);
  }
  if (ticket.booking.status !== "PAID") {
    throw new AppError(ErrorCode.TICKET_NOT_FOUND, "Ticket not found", 404);
  }

  const b = ticket.booking;
  return {
    bookingId: b.id,
    passengerNumber: ticket.passengerNumber,
    passengerName: b.passengerName,
    passengerPhone: b.passengerPhone,
    scheduleId: b.scheduleId,
    departureAt: b.schedule.departureAt.toISOString(),
    routeSlug: b.schedule.route.slug,
    seatLabels: b.seats.map((s) => s.scheduleSeat.label),
    totalAmount: b.totalAmount,
    boardingPoint: b.boardingPoint.name,
  };
}

export async function ticketHtml(input: TicketLookupInput): Promise<string> {
  const t = await lookupTicket(input);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket ${t.passengerNumber}</title>
<style>body{font-family:sans-serif;max-width:480px;margin:2rem auto;padding:1rem;border:1px solid #ccc}
h1{font-size:1.25rem}.row{display:flex;justify-content:space-between;margin:.5rem 0}</style></head>
<body><h1>Bus Ticket — ${t.passengerNumber}</h1>
<div class="row"><span>Passenger</span><strong>${t.passengerName}</strong></div>
<div class="row"><span>Route</span><strong>${t.routeSlug}</strong></div>
<div class="row"><span>Departure</span><strong>${new Date(t.departureAt).toLocaleString()}</strong></div>
<div class="row"><span>Seats</span><strong>${t.seatLabels.join(", ")}</strong></div>
<div class="row"><span>Boarding</span><strong>${t.boardingPoint}</strong></div>
<div class="row"><span>Amount</span><strong>৳${(t.totalAmount / 100).toFixed(2)}</strong></div>
</body></html>`;
}
