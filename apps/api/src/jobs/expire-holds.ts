import { prisma } from "@repo/database";

import { logger } from "../lib/logger.js";

import { releaseHoldSystem } from "../modules/booking/bookings.service.js";



export function startHoldExpiryJob() {

  const intervalMs = 60_000;

  setInterval(async () => {

    try {

      const now = new Date();

      const expired = await prisma.seatHold.findMany({

        where: { expiresAt: { lt: now } },

        include: { booking: true },

      });

      for (const hold of expired) {

        if (hold.booking?.status === "PAID") continue;

        await releaseHoldSystem(hold.id);

      }

      if (expired.length > 0) {

        logger.info({ count: expired.length }, "Expired seat holds cleaned");

      }

    } catch (err) {

      logger.error({ err }, "Hold expiry job failed");

    }

  }, intervalMs);

}

