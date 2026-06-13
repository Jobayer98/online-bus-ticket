import * as React from "react";
import { cn } from "@/lib/utils";

/** Theme-aware admin data table (uses CMS `--primary`, `--border`, `--text`, etc.). */

export const admTableWrap =
  "overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm";

export const admTable = "w-full min-w-0 border-collapse text-sm";

export const admTableHeadRow =
  "border-b border-[var(--border)] bg-[var(--bg)]";

export const admTableHeadCell =
  "px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--muted)] uppercase";

export const admTableRow =
  "border-b border-[var(--border)]/70 transition-colors last:border-0 hover:bg-[var(--primary-muted)]/35";

export const admTableRowSelected =
  "border-b border-[var(--border)]/70 bg-[var(--primary-muted)]/55 last:border-0 ring-1 ring-inset ring-[var(--primary)]/20";

export const admTableCell =
  "px-4 py-3 align-middle text-sm text-[var(--text)]";

export const admTableCellMuted =
  "px-4 py-8 text-center text-sm text-[var(--muted)]";

export const admTableEmpty = admTableCellMuted;

type AdminTableProps = {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
};

export function AdminTable({ children, className, minWidth }: AdminTableProps) {
  return (
    <div className={cn(admTableWrap, className)}>
      <table className={admTable} style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  );
}

type AdminTableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  selected?: boolean;
};

export function AdminTableRow({
  selected = false,
  className,
  children,
  ...props
}: AdminTableRowProps) {
  return (
    <tr className={cn(selected ? admTableRowSelected : admTableRow, className)} {...props}>
      {children}
    </tr>
  );
}

export function adminTableRowClass(selected?: boolean) {
  return selected ? admTableRowSelected : admTableRow;
}
