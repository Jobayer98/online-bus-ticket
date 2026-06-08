"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { adminTabFromPathname } from "@/lib/admin-routes";
import { cn } from "@/lib/utils";

type AdminSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebarNav({ onNavigate, className }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const activeTab = adminTabFromPathname(pathname);

  return (
    <nav className={cn("flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4", className)} aria-label="Admin">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold tracking-widest text-slate-400 uppercase">
            {group.label}
          </p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {group.items.map(({ id, label, href, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <li key={id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors",
                      active
                        ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
