import type { Request, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppError, ErrorCode, Role } from "@repo/shared";

function jwtSecret(): string {
  return process.env.JWT_SECRET ?? "dev-secret-change-me";
}

export interface JwtPayload {
  userId: string;
  role: string;
}

function normalizeToken(raw: string): string {
  let t = raw.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }
  return t;
}

function extractToken(req: Request): {
  token: string | null;
  source: "bearer" | "cookie" | "none";
} {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return { token: normalizeToken(header.slice(7)), source: "bearer" };
  }
  if (header?.trim()) {
    return { token: normalizeToken(header), source: "bearer" };
  }
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) {
      const raw = decodeURIComponent(match[1].replace(/\+/g, " "));
      return { token: normalizeToken(raw), source: "cookie" };
    }
  }
  return { token: null, source: "none" };
}

export const authenticateOptional: RequestHandler = (req, _res, next) => {
  const { token } = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, jwtSecret()) as JwtPayload;
    req.userId = payload.userId;
    req.userRole = payload.role;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};

export const authenticateRequired: RequestHandler = (req, _res, next) => {
  const { token } = extractToken(req);
  if (!token) {
    return next(
      new AppError(ErrorCode.UNAUTHORIZED, "Authentication required", 401),
    );
  }
  try {
    const payload = jwt.verify(token, jwtSecret()) as JwtPayload;
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    next(new AppError(ErrorCode.UNAUTHORIZED, "Invalid token", 401));
  }
};

export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError(ErrorCode.FORBIDDEN, "Forbidden", 403));
    }
    next();
  };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
}

export { Role };
