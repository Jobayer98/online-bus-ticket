import sharp from "sharp";
import {
  formatDateDdMmYyyy,
  formatMoneyBdt,
  formatTime12h,
  slugToRouteTitle,
  type BookingTicketNotificationDto,
} from "@repo/shared";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTicketSvg(ticket: BookingTicketNotificationDto): string {
  const routeTitle = slugToRouteTitle(ticket.routeSlug);
  const departureDate = formatDateDdMmYyyy(ticket.departureAt.slice(0, 10));
  const departureTime = formatTime12h(ticket.departureAt);
  const seats =
    ticket.seatLabels.length === 1
      ? ticket.seatLabels[0]
      : ticket.seatLabels.join(", ");
  const amount = formatMoneyBdt(ticket.totalAmount);

  const rows = [
    ["PNR", ticket.passengerNumber],
    ["Passenger", ticket.passengerName],
    ["Mobile", ticket.passengerPhone],
    ["Journey", routeTitle],
    ["Travel date", departureDate],
    ["Departure", departureTime],
    ["Seat(s)", seats],
    ["Boarding", ticket.boardingPoint],
    ["Amount paid", amount],
  ];

  const rowSvg = rows
    .map(
      ([label, value], i) => `
    <text x="32" y="${118 + i * 34}" font-family="Arial, sans-serif" font-size="11" fill="#64748b">${escapeXml(label)}</text>
    <text x="200" y="${118 + i * 34}" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#0f172a">${escapeXml(value)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="#ffffff"/>
  <rect x="16" y="16" width="608" height="448" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="16" y="16" width="608" height="72" rx="12" fill="#0d9488"/>
  <text x="32" y="48" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">SHAHZADPUR TRAVELS</text>
  <text x="32" y="68" font-family="Arial, sans-serif" font-size="11" fill="#ccfbf1">E-Ticket — CONFIRMED</text>
  <text x="500" y="52" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#ffffff">ONLINE BUS</text>
  ${rowSvg}
  <text x="32" y="450" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Present this ticket at boarding. Keep your PNR and phone for support.</text>
</svg>`;
}

export async function generateTicketPng(
  ticket: BookingTicketNotificationDto,
): Promise<Buffer> {
  const svg = buildTicketSvg(ticket);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
