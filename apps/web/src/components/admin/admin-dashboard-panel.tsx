"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bus,
  CalendarDays,
  CreditCard,
  Ticket,
  TrendingUp,
} from "lucide-react";
import type { AnalyticsOverviewDto, SalesReportDto } from "@repo/shared";
import { useGlobalLoading } from "@/components/global-loading-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api-client";
import { formatMoneyBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  AdminTable,
  AdminTableRow,
  admTableCell,
  admTableCellMuted,
  admTableHeadCell,
  admTableHeadRow,
} from "./admin-table";

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "blue" | "amber" | "violet";
}) {
  const accentClass = {
    primary: "bg-[var(--primary-muted)] text-[var(--primary)]",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  }[accent];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-[var(--text)]">{value}</p>
            {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
          </div>
          <div className={cn("rounded-xl p-2.5", accentClass)}>
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export function AdminDashboardPanel() {
  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [sales, setSales] = useState<SalesReportDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useGlobalLoading(loading);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiGet<AnalyticsOverviewDto>("/admin/reports/analytics/overview"),
      apiGet<SalesReportDto>("/admin/reports/sales"),
    ])
      .then(([o, s]) => {
        setOverview(o.data);
        setSales(s.data);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Performance overview for the last 30 days</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <TrendingUp className="size-3" aria-hidden />
          Live data
        </Badge>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      {overview ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Net revenue"
            value={formatMoneyBdt(overview.netRevenue30d)}
            hint={`Gross ${formatMoneyBdt(overview.grossRevenue30d)} · Refunds ${formatMoneyBdt(overview.refundTotal30d)}`}
            icon={CreditCard}
            accent="primary"
          />
          <MetricCard
            label="Tickets sold"
            value={overview.ticketsSold30d.toLocaleString()}
            hint={
              overview.refundCount30d > 0
                ? `${overview.refundCount30d} refunds`
                : `${overview.seatsSold30d} seats sold`
            }
            icon={Ticket}
            accent="blue"
          />
          <MetricCard
            label="Upcoming trips"
            value={overview.upcomingSchedules.toLocaleString()}
            hint="Scheduled, not yet departed"
            icon={CalendarDays}
            accent="amber"
          />
          <MetricCard
            label="Avg ticket value"
            value={formatMoneyBdt(overview.avgTicketValue)}
            hint={`${overview.seatsSold30d} seats in period`}
            icon={Bus}
            accent="violet"
          />
        </div>
      ) : null}

      {sales ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales by channel</CardTitle>
              <CardDescription>Online vs counter breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {[
                {
                  label: "Online",
                  count: sales.online.count,
                  revenue: sales.online.grossRevenue,
                  trend: "up" as const,
                },
                {
                  label: "Counter",
                  count: sales.counter.count,
                  revenue: sales.counter.grossRevenue,
                  trend: "neutral" as const,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{row.label}</p>
                    <p className="text-sm text-slate-500">{row.count} tickets</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatMoneyBdt(row.revenue)}</p>
                    {row.trend === "up" ? (
                      <p className="flex items-center justify-end gap-0.5 text-xs text-emerald-600">
                        <ArrowUpRight className="size-3" />
                        Active
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">Gross</p>
                  <p className="mt-1 text-sm font-semibold">{formatMoneyBdt(sales.grossRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Refunds</p>
                  <p className="mt-1 flex items-center justify-center gap-0.5 text-sm font-semibold text-red-600">
                    <ArrowDownRight className="size-3" />
                    {formatMoneyBdt(sales.refundTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net</p>
                  <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                    {formatMoneyBdt(sales.netRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top routes</CardTitle>
              <CardDescription>Highest revenue routes in the period</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-0">
              <AdminTable className="rounded-none border-0 shadow-none">
                <thead>
                  <tr className={admTableHeadRow}>
                    <th className={admTableHeadCell}>Route</th>
                    <th className={admTableHeadCell}>Tickets</th>
                    <th className={cn(admTableHeadCell, "text-right")}>Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.byRoute.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={admTableCellMuted}>
                        No route data for this period
                      </td>
                    </tr>
                  ) : (
                    sales.byRoute.map((r) => (
                      <AdminTableRow key={r.routeSlug}>
                        <td className={cn(admTableCell, "font-medium")}>{r.routeSlug}</td>
                        <td className={admTableCell}>{r.count}</td>
                        <td className={cn(admTableCell, "text-right font-medium")}>
                          {formatMoneyBdt(r.grossRevenue)}
                        </td>
                      </AdminTableRow>
                    ))
                  )}
                </tbody>
              </AdminTable>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
