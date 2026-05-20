/** Build search results URL — route slug + date; filters only in query (no stop IDs). */
export function buildSearchUrl(
  routeSlug: string,
  date: string,
  filters?: {
    busType?: string;
    timePeriod?: string;
    seatClass?: string;
  },
): string {
  const q = new URLSearchParams();
  if (filters?.busType) q.set("busType", filters.busType);
  if (filters?.timePeriod) q.set("timePeriod", filters.timePeriod);
  if (filters?.seatClass) q.set("seatClass", filters.seatClass);
  const qs = q.toString();
  return `/search/${routeSlug}/${date}${qs ? `?${qs}` : ""}`;
}

export function cityPairToRouteSlug(fromCity: string, toCity: string): string {
  return `${fromCity}-${toCity}`.toLowerCase().replace(/\s+/g, "-");
}
