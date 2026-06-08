import { SeatClass } from "../enums/index.js";

const SEAT_CLASS_ORDER = [
  SeatClass.STANDARD,
  SeatClass.PREMIUM,
  SeatClass.BUSINESS,
] as const;

export function uniqueSeatClasses(
  seatClasses: Iterable<string>,
): Array<(typeof SEAT_CLASS_ORDER)[number]> {
  const seen = new Set(seatClasses);
  return SEAT_CLASS_ORDER.filter((sc) => seen.has(sc));
}

export function seatClassesFromTemplates(
  templates: { seatClass: string }[] | undefined,
): string[] {
  if (!templates?.length) return [];
  return uniqueSeatClasses(templates.map((t) => t.seatClass));
}
