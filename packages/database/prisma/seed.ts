import "dotenv/config";
import bcrypt from "bcryptjs";
import { buildSeatLabel, priceForScheduleSeat } from "@repo/shared";
import { PrismaClient } from "../generated/client/index.js";
import { seedCms } from "./seed-cms.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // ── SaaS: Create demo tenant ─────────────────────────────────────────────
  const bootstrap = process.env.BOOTSTRAP === "1";
  let demoTenant = await prisma.tenant.findFirst({
    where: { slug: "demo" },
  });
  if (!demoTenant) {
    demoTenant = await prisma.tenant.create({
      data: {
        name: "Demo Bus Company",
        slug: "demo",
        subdomainPrefix: "demo",
        planTier: "PRO",
        planStatus: "ACTIVE",
      },
    });
  } else {
    demoTenant = await prisma.tenant.update({
      where: { id: demoTenant.id },
      data: { name: "Demo Bus Company", subdomainPrefix: "demo" },
    });
  }
  const tenantId = demoTenant.id;

  // ── SUPER_ADMIN user (platform-level, no tenantId) ───────────────────────
  await prisma.user.upsert({
    where: { phone: "01700000000" },
    update: {},
    create: {
      phone: "01700000000",
      email: "superadmin@platform.local",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // ── Tenant ADMIN user ────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { phone: "01700000001" },
    update: {},
    create: {
      phone: "01700000001",
      email: "admin@bus.local",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });
  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId, userId: adminUser.id } },
    update: {},
    create: { tenantId, userId: adminUser.id, role: "ADMIN" },
  });

  // ── Counter Seller user ──────────────────────────────────────────────────
  const counterUser = await prisma.user.upsert({
    where: { phone: "01700000002" },
    update: {},
    create: {
      phone: "01700000002",
      email: "counter@bus.local",
      name: "Counter Seller",
      passwordHash,
      role: "COUNTER_SELLER",
    },
  });
  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId, userId: counterUser.id } },
    update: {},
    create: { tenantId, userId: counterUser.id, role: "COUNTER_SELLER" },
  });

  // ── Stops (scoped to demo tenant) ────────────────────────────────────────
  const dhaka = await prisma.stop.upsert({
    where: { code: "DHK" },
    update: { tenantId },
    create: { name: "Gabtoli", city: "Dhaka", code: "DHK", tenantId },
  });

  const pabna = await prisma.stop.upsert({
    where: { code: "PAB" },
    update: { tenantId },
    create: { name: "Pabna Central", city: "Pabna", code: "PAB", tenantId },
  });

  const route = await prisma.route.upsert({
    where: { tenantId_slug: { tenantId, slug: "dhaka-pabna" } },
    update: {
      fromStopId: dhaka.id,
      toStopId: pabna.id,
      distanceKm: 180,
    },
    create: {
      fromStopId: dhaka.id,
      toStopId: pabna.id,
      slug: "dhaka-pabna",
      distanceKm: 180,
      tenantId,
    },
  });

  const boardingPointSeed = [
    { name: "Gabtoli", sortOrder: 1 },
    { name: "Nabinagar", sortOrder: 2 },
    { name: "Baipayl", sortOrder: 3 },
  ];
  for (const bp of boardingPointSeed) {
    const existing = await prisma.boardingPoint.findFirst({
      where: { routeId: route.id, name: bp.name },
    });
    if (existing) {
      await prisma.boardingPoint.update({
        where: { id: existing.id },
        data: { sortOrder: bp.sortOrder },
      });
    } else {
      await prisma.boardingPoint.create({
        data: { routeId: route.id, ...bp },
      });
    }
  }

  let layout = await prisma.seatLayout.findFirst({
    where: { name: "40 Seat Standard", tenantId },
  });
  if (!layout) {
    layout = await prisma.seatLayout.create({
      data: {
      name: "40 Seat Standard",
      rows: 10,
      cols: 4,
      tenantId,
      templates: {
        create: Array.from({ length: 40 }, (_, i) => {
          const row = Math.floor(i / 4) + 1;
          const col = (i % 4) + 1;
          const label = buildSeatLabel(row, col);
          const seatClass =
            col === 1 ? "BUSINESS" : col === 4 ? "PREMIUM" : "STANDARD";
          return { label, row, col, seatClass };
        }),
      },
    },
    });
  }

  const templates = await prisma.seatTemplate.findMany({
    where: { seatLayoutId: layout.id },
  });
  for (const t of templates) {
    const label = buildSeatLabel(t.row, t.col);
    if (t.label === label) continue;
    const oldLabel = t.label;
    await prisma.seatTemplate.update({
      where: { id: t.id },
      data: { label },
    });
    await prisma.scheduleSeat.updateMany({
      where: { label: oldLabel },
      data: { label },
    });
  }

  const coach = await prisma.coach.upsert({
    where: { coachNumber: "DH-1001" },
    update: { seatLayoutId: layout.id, tenantId },
    create: {
      coachNumber: "DH-1001",
      busType: "AC",
      seatLayoutId: layout.id,
      tenantId,
    },
  });

  const coach2 = await prisma.coach.upsert({
    where: { coachNumber: "DH-1002" },
    update: { seatLayoutId: layout.id, tenantId },
    create: {
      coachNumber: "DH-1002",
      busType: "NON_AC",
      seatLayoutId: layout.id,
      tenantId,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const existingSchedule = await prisma.schedule.findFirst({
    where: { coachId: coach.id, routeId: route.id, tenantId },
  });

  if (!existingSchedule) {
    const dep = new Date(tomorrow);
    const arr = new Date(tomorrow);
    arr.setHours(11, 30, 0, 0);
    const schedule = await prisma.schedule.create({
      data: {
        routeId: route.id,
        coachId: coach.id,
        departureAt: dep,
        estimatedArrivalAt: arr,
        baseFare: 85000,
        tenantId,
      },
    });
    const templates = await prisma.seatTemplate.findMany({
      where: { seatLayoutId: layout.id },
    });
    await prisma.scheduleSeat.createMany({
      data: templates.map((t) => ({
        scheduleId: schedule.id,
        label: t.label,
        seatClass: t.seatClass,
        status: "AVAILABLE",
        price: priceForScheduleSeat(85000),
      })),
    });

    const dep2 = new Date(tomorrow);
    dep2.setHours(14, 0, 0, 0);
    const arr2 = new Date(dep2);
    arr2.setHours(19, 0, 0, 0);
    const schedule2 = await prisma.schedule.create({
      data: {
        routeId: route.id,
        coachId: coach2.id,
        departureAt: dep2,
        estimatedArrivalAt: arr2,
        baseFare: 55000,
        tenantId,
      },
    });
    await prisma.scheduleSeat.createMany({
      data: templates.map((t) => ({
        scheduleId: schedule2.id,
        label: t.label,
        seatClass: t.seatClass,
        status: "SOLD",
        price: priceForScheduleSeat(55000),
      })),
    });
  }

  const schedule2Existing = await prisma.schedule.findFirst({
    where: { coachId: coach2.id, routeId: route.id, tenantId },
  });
  if (schedule2Existing) {
    const seatCount = await prisma.scheduleSeat.count({
      where: { scheduleId: schedule2Existing.id },
    });
    if (seatCount === 0) {
      await prisma.scheduleSeat.createMany({
        data: templates.map((t) => ({
          scheduleId: schedule2Existing.id,
          label: t.label,
          seatClass: t.seatClass,
          status: "SOLD",
          price: priceForScheduleSeat(schedule2Existing.baseFare),
        })),
      });
    }
  }

  await seedCms(prisma, tenantId, { replace: bootstrap });

  // Remove legacy orphan CMS rows (tenantId=null) — the seed has now created tenant-scoped versions
  await prisma.siteProfile.deleteMany({ where: { tenantId: null } });
  await prisma.siteTheme.deleteMany({ where: { tenantId: null } });
  await prisma.contentPage.deleteMany({ where: { tenantId: null } });
  await prisma.siteMedia.deleteMany({ where: { tenantId: null } });
  await prisma.featuredRoute.deleteMany({ where: { tenantId: null } });
  await prisma.footerSettings.deleteMany({ where: { tenantId: null } });

  console.log("Seed complete:");
  console.log("  Super Admin: 01700000000 / password123 (platform-level)");
  console.log("  Admin: 01700000001 / password123 (demo tenant)");
  console.log("  Counter: 01700000002 / password123 (demo tenant)");
  console.log("  Demo tenant subdomain: demo.lvh.me:3000");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
