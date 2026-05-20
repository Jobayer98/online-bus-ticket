/**
 * Must be imported before any module that reads process.env (e.g. auth.ts).
 * ES modules hoist imports, so this file has no other local imports.
 */
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

let loadedEnvPath: string | null = null;
for (const p of candidates) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    loadedEnvPath = p;
    break;
  }
}

// #region agent log
import { createHash } from "crypto";
const _envSecret = process.env.JWT_SECRET;
const _fp = createHash("sha256")
  .update(_envSecret ?? "dev-secret-change-me")
  .digest("hex")
  .slice(0, 8);
fetch("http://127.0.0.1:7854/ingest/f6036832-8c1b-4501-95fc-cb1871e7602a", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "1df7a0",
  },
  body: JSON.stringify({
    sessionId: "1df7a0",
    runId: "startup",
    hypothesisId: "A,E",
    location: "load-env.ts",
    message: "env loaded",
    data: {
      cwd: process.cwd(),
      loadedEnvPath,
      jwtSecretFromEnv: Boolean(_envSecret),
      secretFp: _fp,
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion
