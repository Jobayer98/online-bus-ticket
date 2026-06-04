/**
 * Dev-only destructive database bootstrap: migrate reset + fresh seed.
 * Refuses to run when NODE_ENV=production.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const cmsUploadsDir = path.join(repoRoot, "apps/api/uploads/cms");

function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("db:bootstrap is not allowed when NODE_ENV=production.");
    process.exit(1);
  }

  console.log("Bootstrap: resetting database and reseeding demo tenant…");

  execSync("pnpm exec prisma migrate reset --force", {
    cwd: path.join(repoRoot, "packages/database"),
    stdio: "inherit",
    env: { ...process.env, BOOTSTRAP: "1" },
  });

  if (fs.existsSync(cmsUploadsDir)) {
    fs.rmSync(cmsUploadsDir, { recursive: true, force: true });
    fs.mkdirSync(cmsUploadsDir, { recursive: true });
    console.log("  Cleared CMS upload directory apps/api/uploads/cms");
  }

  console.log("Bootstrap complete.");
}

main();
