import type { RequestHandler } from "express";
import { AppError, ErrorCode } from "@repo/shared";
import { SubdomainTenantResolver } from "./subdomain-tenant-resolver.js";
import type { ResolvedTenant } from "./tenant-resolver.ports.js";

const resolver = new SubdomainTenantResolver();

const BYPASS_PATTERNS = [
  /^\/api\/v1\/platform\//,
  /^\/api\/v1\/auth\//,
  /^\/api\/v1\/health/,
  /^\/api\/v1\/payments\/webhook\//,
  /^\/api\/v1\/payments\/callback\//,
];

function shouldBypass(path: string): boolean {
  return BYPASS_PATTERNS.some((p) => p.test(path));
}

export const tenantResolverMiddleware: RequestHandler = async (
  req,
  _res,
  next,
) => {
  if (shouldBypass(req.path)) return next();

  const slug = req.headers["x-tenant-slug"];
  if (!slug) {
    return next(
      new AppError(
        ErrorCode.TENANT_NOT_FOUND,
        "Tenant not identified. Ensure you are accessing via a valid subdomain.",
        404,
      ),
    );
  }

  try {
    const tenant = await resolver.resolve(req as never);
    if (!tenant) {
      return next(
        new AppError(
          ErrorCode.TENANT_NOT_FOUND,
          `Tenant '${slug}' not found`,
          404,
        ),
      );
    }
    req.tenant = tenant;
    next();
  } catch (err) {
    next(err);
  }
};

declare global {
  namespace Express {
    interface Request {
      tenant?: ResolvedTenant;
    }
  }
}
