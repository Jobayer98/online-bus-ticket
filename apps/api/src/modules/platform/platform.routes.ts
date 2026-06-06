import { Router } from "express";
import {
  createTenantSchema,
  updateTenantSchema,
  registerTenantSchema,
  listPlatformTenantsQuerySchema,
  listPlatformAuditLogsQuerySchema,
  platformDashboardQuerySchema,
  platformUsageQuerySchema,
  listPlatformSubscriptionsQuerySchema,
  upgradeSubscriptionSchema,
  subscriptionRefundSchema,
  platformBillingRevenueQuerySchema,
  platformHealthMetricsQuerySchema,
  listSupportTicketsQuerySchema,
  createSupportTicketSchema,
  replySupportTicketSchema,
  updateSupportTicketSchema,
  listPlatformAlertsQuerySchema,
  updatePlatformAlertSchema,
  listPlatformInvoicesQuerySchema,
  createAnnouncementSchema,
  bulkSuspendTenantsSchema,
  successResponse,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import { platformAuthRouter } from "./platform-auth.routes.js";
import * as platformService from "./platform.service.js";
import { getDashboardOverview } from "./platform-dashboard.service.js";
import {
  buildAuditCsv,
  exportPlatformAuditLogs,
  listPlatformAuditLogs,
  logPlatformAudit,
} from "./platform-audit.service.js";
import {
  buildUsageCsv,
  getTenantUsageDetail,
  getUsageOverview,
} from "./platform-usage.service.js";
import {
  getBillingRevenue,
  listSubscriptions,
  refundSubscription,
  suspendSubscription,
  upgradeSubscription,
} from "./platform-billing.service.js";
import {
  getPlatformHealth,
  getPlatformHealthMetrics,
} from "./platform-health.service.js";
import {
  createSupportTicket,
  getSupportTicket,
  listSupportTickets,
  replySupportTicket,
  updateSupportTicket,
} from "./platform-support.service.js";
import {
  listPlatformAlerts,
  updatePlatformAlert,
} from "./platform-alerts.service.js";
import {
  getInvoiceHtml,
  listPlatformInvoices,
  retryInvoicePayment,
} from "./platform-invoice.service.js";
import {
  createAnnouncement,
  listAnnouncements,
} from "./platform-announcement.service.js";

export const platformRouter = Router();
export const platformRegisterRouter = Router();

export { platformAuthRouter };

function clientIp(req: { ip?: string; headers: Record<string, unknown> }): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.ip ?? null;
}

platformRegisterRouter.post("/", async (req, res, next) => {
  try {
    const input = registerTenantSchema.parse(req.body);
    const data = await platformService.registerTenant(input);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.use(authenticateRequired, requireRole("SUPER_ADMIN"));

platformRouter.get("/dashboard/overview", async (req, res, next) => {
  try {
    const query = platformDashboardQuerySchema.parse(req.query);
    const data = await getDashboardOverview(query.periodDays);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/usage", async (req, res, next) => {
  try {
    const query = platformUsageQuerySchema.parse(req.query);
    const data = await getUsageOverview(query);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/usage/export", async (req, res, next) => {
  try {
    const query = platformUsageQuerySchema.parse(req.query);
    const data = await getUsageOverview(query);
    const csv = buildUsageCsv(data);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="platform-usage.csv"',
    );
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/usage/:tenantId", async (req, res, next) => {
  try {
    const query = platformUsageQuerySchema.parse(req.query);
    const data = await getTenantUsageDetail(
      String(req.params.tenantId),
      query.periodDays,
    );
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/billing/revenue", async (req, res, next) => {
  try {
    const query = platformBillingRevenueQuerySchema.parse(req.query);
    const data = await getBillingRevenue(query);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/billing/subscriptions", async (req, res, next) => {
  try {
    const query = listPlatformSubscriptionsQuerySchema.parse(req.query);
    const data = await listSubscriptions(query);
    res.json({ data: data.subscriptions, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.patch(
  "/billing/subscriptions/:id/upgrade",
  async (req, res, next) => {
    try {
      const input = upgradeSubscriptionSchema.parse(req.body);
      const actor = await platformService.resolveAuditActor(req.userId!);
      const data = await upgradeSubscription(String(req.params.id), input, {
        actor,
        ipAddress: clientIp(req),
      });
      res.json(successResponse(data));
    } catch (e) {
      next(e);
    }
  },
);

platformRouter.post(
  "/billing/subscriptions/:id/suspend",
  async (req, res, next) => {
    try {
      const actor = await platformService.resolveAuditActor(req.userId!);
      const data = await suspendSubscription(String(req.params.id), {
        actor,
        ipAddress: clientIp(req),
      });
      res.json(successResponse(data));
    } catch (e) {
      next(e);
    }
  },
);

platformRouter.post(
  "/billing/subscriptions/:id/refund",
  async (req, res, next) => {
    try {
      const input = subscriptionRefundSchema.parse(req.body);
      const actor = await platformService.resolveAuditActor(req.userId!);
      const data = await refundSubscription(String(req.params.id), input, {
        actor,
        ipAddress: clientIp(req),
      });
      res.json(successResponse(data));
    } catch (e) {
      next(e);
    }
  },
);

platformRouter.get("/health", async (_req, res, next) => {
  try {
    const data = await getPlatformHealth();
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/health/metrics", async (req, res, next) => {
  try {
    const query = platformHealthMetricsQuerySchema.parse(req.query);
    const data = await getPlatformHealthMetrics(query);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants", async (req, res, next) => {
  try {
    const query = listPlatformTenantsQuerySchema.parse(req.query);
    const data = await platformService.listTenants(query);
    res.json({ data: data.tenants, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants/export", async (req, res, next) => {
  try {
    const tenantIds = req.query.tenantIds
      ? String(req.query.tenantIds).split(",").filter(Boolean)
      : undefined;
    const csv = await platformService.exportTenantsCsv(tenantIds);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="platform-tenants.csv"',
    );
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/tenants/bulk-suspend", async (req, res, next) => {
  try {
    const input = bulkSuspendTenantsSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await platformService.bulkSuspendTenants(input.tenantIds, {
      actor,
      ipAddress: clientIp(req),
    });
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/tenants/:id", async (req, res, next) => {
  try {
    const data = await platformService.getTenantDetail(String(req.params.id));
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/tenants", async (req, res, next) => {
  try {
    const input = createTenantSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await platformService.createTenant(input, {
      actor,
      ipAddress: clientIp(req),
    });
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.patch("/tenants/:id", async (req, res, next) => {
  try {
    const input = updateTenantSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await platformService.updateTenant(String(req.params.id), input, {
      actor,
      ipAddress: clientIp(req),
    });
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/audit-logs", async (req, res, next) => {
  try {
    const query = listPlatformAuditLogsQuerySchema.parse(req.query);
    const data = await listPlatformAuditLogs(query);
    res.json({ data: data.logs, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/audit-logs/export", async (req, res, next) => {
  try {
    const query = listPlatformAuditLogsQuerySchema.parse(req.query);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const logs = await exportPlatformAuditLogs(query);
    await logPlatformAudit({
      action: "EXPORT",
      resourceType: "TENANT",
      resourceId: "audit-logs",
      changes: { count: logs.length, filters: query },
      ipAddress: clientIp(req),
      actor,
    });
    const csv = buildAuditCsv(logs);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="platform-audit-logs.csv"',
    );
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/support/tickets", async (req, res, next) => {
  try {
    const query = listSupportTicketsQuerySchema.parse(req.query);
    const data = await listSupportTickets(query);
    res.json({ data: data.tickets, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/support/tickets/:id", async (req, res, next) => {
  try {
    const data = await getSupportTicket(String(req.params.id));
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/support/tickets", async (req, res, next) => {
  try {
    const input = createSupportTicketSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await createSupportTicket(input, actor);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/support/tickets/:id/reply", async (req, res, next) => {
  try {
    const input = replySupportTicketSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await replySupportTicket(String(req.params.id), input, actor);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.patch("/support/tickets/:id", async (req, res, next) => {
  try {
    const input = updateSupportTicketSchema.parse(req.body);
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await updateSupportTicket(String(req.params.id), input, actor);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/alerts", async (req, res, next) => {
  try {
    const query = listPlatformAlertsQuerySchema.parse(req.query);
    const data = await listPlatformAlerts(query);
    res.json({ data: data.alerts, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.patch("/alerts/:id", async (req, res, next) => {
  try {
    const input = updatePlatformAlertSchema.parse(req.body);
    const data = await updatePlatformAlert(String(req.params.id), input);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/billing/invoices", async (req, res, next) => {
  try {
    const query = listPlatformInvoicesQuerySchema.parse(req.query);
    const data = await listPlatformInvoices(query);
    res.json({ data: data.invoices, meta: data.meta });
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/billing/invoices/:id/download", async (req, res, next) => {
  try {
    const html = await getInvoiceHtml(String(req.params.id));
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${req.params.id}.html"`,
    );
    res.send(html);
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/billing/invoices/:id/retry", async (req, res, next) => {
  try {
    const actor = await platformService.resolveAuditActor(req.userId!);
    const data = await retryInvoicePayment(String(req.params.id), {
      actor,
      ipAddress: clientIp(req),
    });
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.get("/announcements", async (_req, res, next) => {
  try {
    const data = await listAnnouncements();
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

platformRouter.post("/announcements", async (req, res, next) => {
  try {
    const input = createAnnouncementSchema.parse(req.body);
    const data = await createAnnouncement(input, req.userId!);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
