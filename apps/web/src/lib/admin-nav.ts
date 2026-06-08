import {
  BarChart3,
  Bus,
  Calendar,
  CreditCard,
  FileText,
  Grid3x3,
  LayoutDashboard,
  MapPin,
  Route,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ADMIN_TAB_HREF, type AdminTab } from "@/lib/admin-routes";

export type AdminNavItem = {
  id: AdminTab;
  label: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: ADMIN_TAB_HREF.dashboard,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "stops", label: "Stops", href: ADMIN_TAB_HREF.stops, icon: MapPin },
      { id: "routes", label: "Routes", href: ADMIN_TAB_HREF.routes, icon: Route },
      { id: "layouts", label: "Layouts", href: ADMIN_TAB_HREF.layouts, icon: Grid3x3 },
      { id: "coaches", label: "Coaches", href: ADMIN_TAB_HREF.coaches, icon: Bus },
      {
        id: "schedules",
        label: "Schedules",
        href: ADMIN_TAB_HREF.schedules,
        icon: Calendar,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        id: "reports",
        label: "Reports",
        href: ADMIN_TAB_HREF.reports,
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Site & billing",
    items: [
      { id: "content", label: "Content", href: ADMIN_TAB_HREF.content, icon: FileText },
      {
        id: "payments",
        label: "Payments",
        href: ADMIN_TAB_HREF.payments,
        icon: CreditCard,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        href: ADMIN_TAB_HREF.settings,
        icon: Settings,
      },
    ],
  },
];

export const ADMIN_TAB_LABEL: Record<AdminTab, string> = {
  dashboard: "Dashboard",
  stops: "Stops",
  routes: "Routes",
  layouts: "Seat layouts",
  coaches: "Coaches",
  schedules: "Schedules",
  reports: "Reports",
  content: "Content",
  payments: "Payments",
  settings: "Settings",
};

export const ADMIN_TAB_DESCRIPTION: Partial<Record<AdminTab, string>> = {
  dashboard: "Key metrics and performance for the last 30 days.",
  stops: "Manage bus stops and city codes.",
  routes: "Configure routes and boarding points.",
  layouts: "Design seat maps for coaches.",
  coaches: "Register coaches and assign layouts.",
  schedules: "Create and manage trip schedules.",
  reports: "Sales analytics and exportable reports.",
  content: "CMS for your public booking site.",
  payments: "Payment settings and transaction history.",
  settings: "Tenant configuration and preferences.",
};
