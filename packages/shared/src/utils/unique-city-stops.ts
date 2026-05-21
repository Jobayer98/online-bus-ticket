export type StopLike = { id: string; name: string; city: string; code: string };

export function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase();
}

/** One representative stop per city (alphabetically first stop name). */
export function uniqueStopsByCity<T extends StopLike>(stops: T[]): T[] {
  const map = new Map<string, T>();
  for (const stop of stops) {
    const key = normalizeCityKey(stop.city);
    const existing = map.get(key);
    if (!existing || stop.name.localeCompare(existing.name) < 0) {
      map.set(key, stop);
    }
  }
  return [...map.values()].sort((a, b) =>
    a.city.localeCompare(b.city, undefined, { sensitivity: "base" }),
  );
}

export function resolveStopIdForCity<T extends StopLike>(
  stops: T[],
  city: string,
): string | undefined {
  const key = normalizeCityKey(city);
  const match = uniqueStopsByCity(stops).find(
    (s) => normalizeCityKey(s.city) === key,
  );
  return match?.id;
}
