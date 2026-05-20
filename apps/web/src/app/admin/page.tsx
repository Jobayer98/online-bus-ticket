"use client";

import { useEffect, useState } from "react";
import { apiDownload, apiGet } from "@/lib/api-client";
import { getAuthRole } from "@/lib/auth-session";

export default function AdminPage() {
  const [overview, setOverview] = useState<Record<string, number> | null>(null);
  const [sales, setSales] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (getAuthRole() && getAuthRole() !== "ADMIN") {
      setError("Admin role required. Log in as 01700000001.");
      return;
    }
    Promise.all([
      apiGet<Record<string, number>>("/admin/reports/analytics/overview"),
      apiGet<Record<string, unknown>>("/admin/reports/sales"),
    ])
      .then(([o, s]) => {
        setOverview(o.data);
        setSales(s.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="container">
      <h1>Admin dashboard</h1>
      {error && <p className="error">Login as admin: 01700000001 / password123</p>}
      {overview && (
        <article className="card">
          <h2>Overview (30 days)</h2>
          <p>Revenue: ৳{((overview.revenue30d ?? 0) / 100).toFixed(2)}</p>
          <p>Tickets: {overview.tickets30d}</p>
          <p>Active schedules: {overview.activeSchedules}</p>
          <p>Avg ticket: ৳{((overview.avgTicketValue ?? 0) / 100).toFixed(2)}</p>
        </article>
      )}
      {sales && (
        <article className="card">
          <h2>Sales report</h2>
          <pre style={{ fontSize: "0.85rem", overflow: "auto" }}>
            {JSON.stringify(sales, null, 2)}
          </pre>
          <button
            type="button"
            className="btn"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                await apiDownload("/admin/reports/export/csv", "sales.csv");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Export failed");
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </article>
      )}
    </section>
  );
}
