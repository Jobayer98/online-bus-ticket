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

for (const p of candidates) {
  if (existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
