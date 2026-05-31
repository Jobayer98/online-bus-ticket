export function formatTime12h(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateDdMmYyyy(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatBusTypeLabel(busType: string): string {
  if (busType === "NON_AC") return "NON AC";
  return busType.replace("_", " ");
}

export function formatSeatClassLabel(seatClass: string): string {
  return seatClass.replace("_", " ");
}

export function formatScheduleClassLine(
  busType: string,
  seatClasses: string[],
): string {
  const classLabel = seatClasses.map(formatSeatClassLabel).join(", ");
  return classLabel
    ? `${formatBusTypeLabel(busType)} | ${classLabel}`
    : formatBusTypeLabel(busType);
}

export function formatMoneyBdt(minorUnits: number): string {
  return `৳ ${(minorUnits / 100).toFixed(0)}`;
}

export function slugToRouteTitle(slug: string): string {
  return slug
    .split("-")
    .map((p) => p.toUpperCase())
    .join(" To ")
    .replace(/\bTO\b/g, "To");
}
