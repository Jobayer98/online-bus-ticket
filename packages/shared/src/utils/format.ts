export function formatTime12h(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  });
}

export function formatDateDdMmYyyy(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00+06:00`);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
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
