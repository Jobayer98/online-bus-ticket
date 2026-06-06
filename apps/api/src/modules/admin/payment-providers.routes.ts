import { Router } from "express";
import {
  paymentProviderCodeSchema,
  upsertTenantPaymentProviderSchema,
  createBankAccountSchema,
  createWithdrawalSchema,
  successResponse,
} from "@repo/shared";
import { authenticateRequired, requireRole } from "../../middleware/auth.js";
import * as paymentProvidersService from "./payment-providers.service.js";

export const adminPaymentProvidersRouter = Router();

adminPaymentProvidersRouter.use(
  authenticateRequired,
  requireRole("ADMIN"),
);

adminPaymentProvidersRouter.get("/payment-providers", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const data = await paymentProvidersService.listTenantPaymentProviders(tenantId);
    res.json(successResponse({ providers: data }));
  } catch (e) {
    next(e);
  }
});

adminPaymentProvidersRouter.put(
  "/payment-providers/:code",
  async (req, res, next) => {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
        return;
      }
      const code = paymentProviderCodeSchema.parse(req.params.code);
      const input = upsertTenantPaymentProviderSchema.parse(req.body);
      const data = await paymentProvidersService.upsertTenantPaymentProvider(
        tenantId,
        code,
        input,
      );
      res.json(successResponse(data));
    } catch (e) {
      next(e);
    }
  },
);

adminPaymentProvidersRouter.delete(
  "/payment-providers/:code",
  async (req, res, next) => {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
        return;
      }
      const code = paymentProviderCodeSchema.parse(req.params.code);
      await paymentProvidersService.deleteTenantPaymentProvider(tenantId, code);
      res.json(successResponse({ deleted: true }));
    } catch (e) {
      next(e);
    }
  },
);

adminPaymentProvidersRouter.get("/wallet", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const data = await paymentProvidersService.getTenantWalletSummary(tenantId);
    res.json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

adminPaymentProvidersRouter.get("/bank-accounts", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const data = await paymentProvidersService.listBankAccounts(tenantId);
    res.json(successResponse({ accounts: data }));
  } catch (e) {
    next(e);
  }
});

adminPaymentProvidersRouter.post("/bank-accounts", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const input = createBankAccountSchema.parse(req.body);
    const data = await paymentProvidersService.createBankAccount(tenantId, input);
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});

adminPaymentProvidersRouter.delete(
  "/bank-accounts/:id",
  async (req, res, next) => {
    try {
      const tenantId = req.tenant?.id;
      if (!tenantId) {
        res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
        return;
      }
      await paymentProvidersService.deleteBankAccount(tenantId, req.params.id);
      res.json(successResponse({ deleted: true }));
    } catch (e) {
      next(e);
    }
  },
);

adminPaymentProvidersRouter.get("/withdrawals", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const data = await paymentProvidersService.listTenantWithdrawals(tenantId);
    res.json(successResponse({ withdrawals: data }));
  } catch (e) {
    next(e);
  }
});

adminPaymentProvidersRouter.post("/withdrawals", async (req, res, next) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Tenant required" } });
      return;
    }
    const input = createWithdrawalSchema.parse(req.body);
    const data = await paymentProvidersService.createWithdrawalRequest(
      tenantId,
      input,
    );
    res.status(201).json(successResponse(data));
  } catch (e) {
    next(e);
  }
});
