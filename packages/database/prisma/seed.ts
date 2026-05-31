import "dotenv/config";
import bcrypt from "bcryptjs";
import { buildSeatLabel, priceForScheduleSeat } from "@repo/shared";
import { PrismaClient } from "../generated/client/index.js";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  const dhaka = await prisma.stop.upsert({
    where: { code: "DHK" },
    update: {},
    create: { name: "Gabtoli", city: "Dhaka", code: "DHK" },
  });

  const pabna = await prisma.stop.upsert({
    where: { code: "PAB" },
    update: {},
    create: { name: "Pabna Central", city: "Pabna", code: "PAB" },
  });

  const route = await prisma.route.upsert({
    where: { slug: "dhaka-pabna" },
    update: {},
    create: {
      fromStopId: dhaka.id,
      toStopId: pabna.id,
      slug: "dhaka-pabna",
      distanceKm: 180,
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
    where: { name: "40 Seat Standard" },
  });
  if (!layout) {
    layout = await prisma.seatLayout.create({
      data: {
      name: "40 Seat Standard",
      rows: 10,
      cols: 4,
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
    update: { seatLayoutId: layout.id },
    create: {
      coachNumber: "DH-1001",
      busType: "AC",
      seatLayoutId: layout.id,
    },
  });

  const coach2 = await prisma.coach.upsert({
    where: { coachNumber: "DH-1002" },
    update: {},
    create: {
      coachNumber: "DH-1002",
      busType: "NON_AC",
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(6, 0, 0, 0);

  const existingSchedule = await prisma.schedule.findFirst({
    where: { coachId: coach.id, routeId: route.id },
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
    await prisma.schedule.create({
      data: {
        routeId: route.id,
        coachId: coach2.id,
        departureAt: dep2,
        estimatedArrivalAt: arr2,
        baseFare: 55000,
      },
    });
  }

  console.log("Seed complete:");
  console.log("  Admin: 01700000001 / password123");
  console.log("  Counter: 01700000002 / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
