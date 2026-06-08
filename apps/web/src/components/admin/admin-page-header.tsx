import * as React from "react";
import { ADMIN_TAB_DESCRIPTION, ADMIN_TAB_LABEL } from "@/lib/admin-nav";
import type { AdminTab } from "@/lib/admin-routes";

type AdminPageHeaderProps = {
  tab: AdminTab;
  actions?: React.ReactNode;
};

export function AdminPageHeader({ tab, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {ADMIN_TAB_LABEL[tab]}
        </h1>
        {ADMIN_TAB_DESCRIPTION[tab] ? (
          <p className="mt-1 text-sm text-slate-500">{ADMIN_TAB_DESCRIPTION[tab]}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
