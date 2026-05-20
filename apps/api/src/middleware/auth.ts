import type { Request, RequestHandler } from "express";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { AppError, ErrorCode, Role } from "@repo/shared";

function jwtSecret(): string {
  return process.env.JWT_SECRET ?? "dev-secret-change-me";
}

function secretFingerprint(): string {
  return createHash("sha256").update(jwtSecret()).digest("hex").slice(0, 8);
}

function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
  runId = "runtime",
) {
  // #region agent log
  fetch("http://127.0.0.1:7854/ingest/f6036832-8c1b-4501-95fc-cb1871e7602a", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1df7a0",
    },
    body: JSON.stringify({
      sessionId: "1df7a0",
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
  const { token, source } = extractToken(req);
  if (!token) {
    debugLog("B", "auth.ts:authenticateRequired", "no token", {
      path: req.path,
      source,
      hasAuthHeader: Boolean(req.headers.authorization),
      hasCookie: Boolean(req.headers.cookie),
    });
    return next(
      new AppError(ErrorCode.UNAUTHORIZED, "Authentication required", 401),
    );
  }
  const parts = token.split(".").length;
  try {
    const payload = jwt.verify(token, jwtSecret()) as JwtPayload;
    debugLog("A,C", "auth.ts:authenticateRequired", "verify ok", {
      path: req.path,
      source,
      tokenParts: parts,
      tokenLen: token.length,
      secretFp: secretFingerprint(),
      role: payload.role,
    });
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (err) {
    const e = err as Error & { name?: string };
    debugLog("A,B,C,D", "auth.ts:authenticateRequired", "verify failed", {
      path: req.path,
      source,
      tokenParts: parts,
      tokenLen: token.length,
      tokenStartsBearer: req.headers.cookie?.includes("Bearer") ?? false,
      secretFp: secretFingerprint(),
      jwtSecretFromEnv: Boolean(process.env.JWT_SECRET),
      errorName: e.name,
      errorMessage: e.message,
    });
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
  const token = jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
  debugLog("A,D", "auth.ts:signToken", "token signed", {
    role: payload.role,
    tokenLen: token.length,
    secretFp: secretFingerprint(),
    jwtSecretFromEnv: Boolean(process.env.JWT_SECRET),
  });
  return token;
}

export { Role };
