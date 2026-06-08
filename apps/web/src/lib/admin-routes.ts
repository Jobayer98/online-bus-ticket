export type AdminTab =
  | "dashboard"
  | "stops"
  | "routes"
  | "layouts"
  | "coaches"
  | "schedules"
  | "reports"
  | "content"
  | "payments"
  | "settings";

export const ADMIN_TAB_HREF: Record<AdminTab, string> = {
  dashboard: "/admin/dashboard",
  stops: "/admin/stops",
  routes: "/admin/routes",
  layouts: "/admin/layouts",
  coaches: "/admin/coaches",
  schedules: "/admin/schedules",
  reports: "/admin/reports",
  content: "/admin/content",
  payments: "/admin/payments",
  settings: "/admin/settings",
};

export function adminTabFromPathname(pathname: string): AdminTab | null {
  if (pathname === "/admin") return "dashboard";

  for (const [tab, href] of Object.entries(ADMIN_TAB_HREF) as [AdminTab, string][]) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return tab;
    }
  }

  return null;
}
