"use client";

import Link from "next/link";
import { ExternalLink, LogOut, Store } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminSidebarNav } from "./admin-sidebar-nav";

type AdminSidebarProps = {
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ onLogout, onNavigate, className }: AdminSidebarProps) {
  return (
    <aside className={className}>
      <div className="flex h-16 items-center border-b border-[var(--border)] px-4">
        <BrandLogo className="inline-flex min-w-0 items-center gap-2 no-underline text-[#222] [&_small]:text-slate-500" />
      </div>

      <AdminSidebarNav onNavigate={onNavigate} />

      <div className="mt-auto border-t border-[var(--border)] p-3">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/counter" onClick={onNavigate}>
              <Store className="size-4" />
              Counter POS
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/" onClick={onNavigate}>
              <ExternalLink className="size-4" />
              Public site
            </Link>
          </Button>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600 hover:bg-red-50 hover:text-red-700"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
