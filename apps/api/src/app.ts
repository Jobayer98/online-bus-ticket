import express from "express";

import cors from "cors";

import cookieParser from "cookie-parser";

import pinoHttp from "pino-http";

import { requestIdMiddleware } from "./middleware/request-id.js";

import { authenticateOptional } from "./middleware/auth.js";

import { platformApiTelemetryMiddleware } from "./middleware/platform-api-telemetry.middleware.js";
import { tenantResolverMiddleware } from "./middleware/tenant-resolver.middleware.js";

import { createCorsOptions } from "./lib/cors-config.js";

import { logger } from "./lib/logger.js";

import { setupSwagger } from "./swagger/setup.js";

import { healthRouter } from "./modules/health/health.routes.js";

import { authRouter } from "./modules/identity/auth.routes.js";

import { usersRouter } from "./modules/identity/users.routes.js";

import { adminStopsRouter } from "./modules/admin/stops.routes.js";

import { adminRoutesRouter } from "./modules/admin/routes.routes.js";

import { adminCoachesRouter } from "./modules/admin/coaches.routes.js";

import { adminLayoutsRouter } from "./modules/admin/layouts.routes.js";

import { adminSchedulesRouter } from "./modules/admin/schedules.routes.js";

import { adminReportsRouter } from "./modules/admin/reports.routes.js";

import { adminMembersRouter } from "./modules/admin/members.routes.js";

import { adminCmsRouter, publicCmsRouter } from "./modules/admin/cms/cms.routes.js";

import {
  platformRouter,
  platformRegisterRouter,
  platformAuthRouter,
} from "./modules/platform/platform.routes.js";

import { schedulesRouter } from "./modules/schedule/schedules.routes.js";

import { bookingsRouter } from "./modules/booking/bookings.routes.js";

import { paymentsRouter } from "./modules/payment/payments.routes.js";

import { ticketsRouter } from "./modules/ticket/tickets.routes.js";

import { counterRouter } from "./modules/counter/counter.routes.js";



export async function createApp() {

  const app = express();



  app.use(cors(createCorsOptions()));

  app.use(express.json());

  app.use(cookieParser());

  app.use(requestIdMiddleware);

  app.use(

    pinoHttp({

      logger,

      customProps: (req) => ({ requestId: req.requestId }),

    }),

  );

  app.use(authenticateOptional);

  app.use(tenantResolverMiddleware);

  if (process.env.ENABLE_SWAGGER !== "false") {

    await setupSwagger(app);

  }



  const v1 = express.Router();

  v1.use(platformApiTelemetryMiddleware);

  v1.use(healthRouter);

  v1.use("/platform/register", platformRegisterRouter);
  v1.use("/platform/auth", platformAuthRouter);
  v1.use("/platform", platformRouter);

  v1.use("/auth", authRouter);

  v1.use("/users", usersRouter);

  v1.use("/schedules", schedulesRouter);

  v1.use("/bookings", bookingsRouter);

  v1.use("/payments", paymentsRouter);

  v1.use("/tickets", ticketsRouter);

  v1.use("/counter", counterRouter);

  v1.use("/admin/stops", adminStopsRouter);

  v1.use("/admin/routes", adminRoutesRouter);

  v1.use("/admin/coaches", adminCoachesRouter);

  v1.use("/admin/layouts", adminLayoutsRouter);

  v1.use("/admin/schedules", adminSchedulesRouter);

  v1.use("/admin/reports", adminReportsRouter);

  v1.use("/admin/members", adminMembersRouter);

  v1.use("/admin/cms", adminCmsRouter);

  v1.use("/cms", publicCmsRouter);



  app.use("/api/v1", v1);



  return app;

}

