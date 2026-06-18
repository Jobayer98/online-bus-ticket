import path from "path";
import { existsSync } from "fs";
import type { Express, RequestHandler } from "express";
import SwaggerParser from "@apidevtools/swagger-parser";
import swaggerUi from "swagger-ui-express";
import { logger } from "../lib/logger.js";

function resolveOpenApiEntry(): string {
  const candidates = [
    path.join(process.cwd(), "openapi", "openapi.yaml"),
    path.join(process.cwd(), "apps", "api", "openapi", "openapi.yaml"),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      `OpenAPI entry not found (tried: ${candidates.join(", ")})`,
    );
  }
  return found;
}

const uiOptions = {
  customSiteTitle: "Bus Ticket API",
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
  },
};

export async function setupSwagger(app: Express): Promise<void> {
  const spec = await SwaggerParser.bundle(resolveOpenApiEntry());
  const setupHandler = swaggerUi.setup(spec, uiOptions) as RequestHandler;

  app.get("/api-docs/openapi.json", (_req, res) => {
    res.json(spec);
  });

  // swagger-ui-express: serve static assets, then GET handlers for the HTML shell
  app.use("/api-docs", ...swaggerUi.serve);
  app.get("/api-docs", setupHandler);
  app.get("/api-docs/", setupHandler);

  logger.info(
    `Swagger UI at http://localhost:${process.env.API_PORT ?? 4100}/api-docs`,
  );
}
