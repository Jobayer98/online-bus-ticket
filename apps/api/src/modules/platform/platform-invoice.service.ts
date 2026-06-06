import type { Prisma } from "@repo/database";
import { prisma } from "@repo/database";
import {
  AppError,
  ErrorCode,
  formatMoneyBdt,
  type ListPlatformInvoicesQuery,
  type PlatformInvoiceDto,
} from "@repo/shared";
import {
  logPlatformAudit,
  type PlatformAuditActor,
} from "./platform-audit.service.js";

function invoiceNumberFor(subId: string, periodStart: Date): string {
  const ym = periodStart.toISOString().slice(0, 7).replace("-", "");
  return `INV-${ym}-${subId.slice(-6).toUpperCase()}`;
}

function toInvoiceDto(row: {
  id: string;
  tenantId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amountMinor: number;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  tenant: { name: string };
}): PlatformInvoiceDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantName: row.tenant.name,
    subscriptionId: row.subscriptionId,
    invoiceNumber: row.invoiceNumber,
    amountMinor: row.amountMinor,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    status: row.status as PlatformInvoiceDto["status"],
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ensureInvoicesForActiveSubscriptions(): Promise<void> {
  const subs = await prisma.subscription.findMany({
    where: { status: { in: ["ACTIVE", "PAST_DUE", "TRIAL"] } },
  });

  for (const sub of subs) {
    const periodStart = sub.billingCycleStart;
    const existing = await prisma.platformInvoice.findFirst({
      where: {
        subscriptionId: sub.id,
        periodStart,
      },
    });
    if (existing) continue;

    await prisma.platformInvoice.create({
      data: {
        tenantId: sub.tenantId,
        subscriptionId: sub.id,
        invoiceNumber: invoiceNumberFor(sub.id, periodStart),
        amountMinor: sub.monthlyPriceMinor,
        periodStart,
        periodEnd: sub.billingCycleEnd,
        status: sub.status === "PAST_DUE" ? "FAILED" : "PENDING",
      },
    });
  }
}

export async function listPlatformInvoices(query: ListPlatformInvoicesQuery) {
  await ensureInvoicesForActiveSubscriptions();

  const skip = (query.page - 1) * query.pageSize;
  const where: Prisma.PlatformInvoiceWhereInput = {};
  if (query.tenantId) where.tenantId = query.tenantId;
  if (query.status) where.status = query.status;

  const [rows, total] = await Promise.all([
    prisma.platformInvoice.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: "desc" },
      include: { tenant: { select: { name: true } } },
    }),
    prisma.platformInvoice.count({ where }),
  ]);

  return {
    invoices: rows.map(toInvoiceDto),
    meta: { page: query.page, pageSize: query.pageSize, total },
  };
}

export async function getInvoiceHtml(id: string): Promise<string> {
  const invoice = await prisma.platformInvoice.findUnique({
    where: { id },
    include: {
      tenant: { select: { name: true, slug: true } },
      subscription: { select: { planTier: true } },
    },
  });
  if (!invoice) {
    throw new AppError(ErrorCode.NOT_FOUND, "Invoice not found", 404);
  }

  const amount = formatMoneyBdt(invoice.amountMinor);
  const period = `${invoice.periodStart.toLocaleDateString("en-GB")} – ${invoice.periodEnd.toLocaleDateString("en-GB")}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; color: #111; }
    h1 { font-size: 1.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
    .meta { color: #6b7280; font-size: 0.875rem; }
    .total { font-weight: 700; font-size: 1.125rem; }
  </style>
</head>
<body>
  <h1>Invoice ${invoice.invoiceNumber}</h1>
  <p class="meta">Status: ${invoice.status}</p>
  <p><strong>Bill to:</strong> ${invoice.tenant.name} (${invoice.tenant.slug})</p>
  <p><strong>Plan:</strong> ${invoice.subscription.planTier}</p>
  <p><strong>Billing period:</strong> ${period}</p>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Monthly subscription</td><td>${amount}</td></tr>
    </tbody>
  </table>
  <p class="total">Total due: ${amount}</p>
  <p class="meta">Generated ${new Date().toISOString()}</p>
</body>
</html>`;
}

export async function retryInvoicePayment(
  id: string,
  audit: { actor: PlatformAuditActor; ipAddress?: string | null },
) {
  const invoice = await prisma.platformInvoice.findUnique({ where: { id } });
  if (!invoice) {
    throw new AppError(ErrorCode.NOT_FOUND, "Invoice not found", 404);
  }
  if (invoice.status === "PAID") {
    throw new AppError(ErrorCode.CONFLICT, "Invoice already paid", 409);
  }

  const success = Math.random() > 0.3;

  const updated = await prisma.platformInvoice.update({
    where: { id },
    data: success
      ? { status: "PAID", paidAt: new Date() }
      : { status: "FAILED" },
    include: { tenant: { select: { name: true } } },
  });

  if (success) {
    await prisma.subscription.update({
      where: { id: invoice.subscriptionId },
      data: { status: "ACTIVE" },
    });
  }

  await logPlatformAudit({
    action: "UPDATE",
    resourceType: "TENANT",
    resourceId: invoice.tenantId,
    changes: {
      invoiceId: id,
      retryResult: success ? "PAID" : "FAILED",
    },
    ipAddress: audit.ipAddress,
    actor: audit.actor,
  });

  return toInvoiceDto(updated);
}
