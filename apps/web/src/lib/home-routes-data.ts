/** Row-major order in a 3-column grid (matches reference layout). */
export const HOME_AVAILABLE_ROUTES: { from: string; to: string }[] = [
  { from: "DHAKA", to: "PABNA" },
  { from: "DHAKA", to: "SHAHZADPUR" },
  { from: "DHAKA", to: "ISWARDI" },
  { from: "DHAKA", to: "CHATMOHOR" },
  { from: "DHAKA", to: "CHATTOGRAM" },
  { from: "NARAYANGONJ", to: "PABNA" },
  { from: "NARAYANGONJ", to: "SHAHZADPUR" },
  { from: "PABNA", to: "NARAYANGONJ" },
  { from: "PABNA", to: "CHATTOGRAM" },
  { from: "PABNA", to: "COX'S BAZAR" },
  { from: "PABNA", to: "SYLHET" },
  { from: "SYLHET", to: "ISWARDI" },
];

export function cityToSlugPart(city: string): string {
  return city
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/\s+/g, "-");
}
