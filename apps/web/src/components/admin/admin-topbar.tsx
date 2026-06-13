"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Clock, Menu } from "lucide-react";
import { ADMIN_TAB_DESCRIPTION, ADMIN_TAB_LABEL } from "@/lib/admin-nav";
import { adminTabFromPathname } from "@/lib/admin-routes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

type AdminTopbarProps = {
  clock: string;
  onLogout: () => void;
};

export function AdminTopbar({ clock, onLogout }: AdminTopbarProps) {
  const pathname = usePathname();
  const activeTab = adminTabFromPathname(pathname);
  const title = activeTab ? ADMIN_TAB_LABEL[activeTab] : "Administration";
  const description = activeTab ? ADMIN_TAB_DESCRIPTION[activeTab] : undefined;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-[var(--border)] bg-[var(--card)]/90 px-4 backdrop-blur-md md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 lg:hidden" aria-label="Open menu">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="p-0">
          <AdminSidebar
            onLogout={() => {
              setMobileOpen(false);
              onLogout();
            }}
            onNavigate={() => setMobileOpen(false)}
            className="flex h-full flex-col"
          />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Admin</span>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate font-medium text-[var(--text)]">{title}</span>
        </div>
        {description ? (
          <p className="mt-0.5 truncate text-xs text-[var(--muted)] max-md:hidden">{description}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Badge variant="secondary" className="hidden gap-1.5 font-normal sm:inline-flex">
          <Clock className="size-3" aria-hidden />
          {clock} Dhaka
        </Badge>
      </div>
    </header>
  );
}
