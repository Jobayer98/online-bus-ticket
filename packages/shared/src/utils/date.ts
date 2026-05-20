const TZ = "Asia/Dhaka";

/** Returns YYYY-MM-DD for today in Asia/Dhaka */
export function todayInDhaka(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
    new Date(),
  );
}

/** Trip date must be >= today in Asia/Dhaka */
export function isValidTripDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr >= todayInDhaka();
}

export function getTimePeriod(
  departureAt: Date,
): "MORNING" | "NOON" | "AFTERNOON" | "NIGHT" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "numeric",
      hour12: false,
    }).format(departureAt),
  );
  if (hour >= 5 && hour < 11) return "MORNING";
  if (hour >= 11 && hour < 14) return "NOON";
  if (hour >= 14 && hour < 18) return "AFTERNOON";
  return "NIGHT";
}
