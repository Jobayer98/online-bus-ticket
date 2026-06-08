import { prisma } from "@repo/database";
import type { ImportCoachesInput, ImportResultDto } from "@repo/shared";

export async function importCoaches(
  input: ImportCoachesInput,
  tenantId: string | undefined,
): Promise<ImportResultDto> {
  const result: ImportResultDto = { created: 0, skipped: 0, errors: [] };

  const layoutNames = [
    ...new Set(
      input.rows
        .map((r) => r.seatLayoutName?.trim())
        .filter((n): n is string => Boolean(n)),
    ),
  ];

  const layouts =
    layoutNames.length > 0
      ? await prisma.seatLayout.findMany({
          where: { tenantId, name: { in: layoutNames } },
          select: { id: true, name: true },
        })
      : [];

  const layoutByName = new Map(layouts.map((l) => [l.name, l.id]));

  for (let i = 0; i < input.rows.length; i++) {
    const rowNum = i + 1;
    const row = input.rows[i]!;
    const coachNumber = row.coachNumber.trim();
    const layoutName = row.seatLayoutName?.trim();

    if (layoutName && !layoutByName.has(layoutName)) {
      result.errors.push({
        row: rowNum,
        message: `Seat layout not found: "${layoutName}"`,
      });
      continue;
    }

    const existing = await prisma.coach.findUnique({
      where: { coachNumber },
      select: { id: true },
    });

    if (existing) {
      if (input.skipDuplicates) {
        result.skipped++;
        continue;
      }
      result.errors.push({
        row: rowNum,
        message: `Coach number already exists: "${coachNumber}"`,
      });
      continue;
    }

    await prisma.coach.create({
      data: {
        coachNumber,
        busType: row.busType,
        seatLayoutId: layoutName ? layoutByName.get(layoutName)! : null,
        tenantId,
      },
    });
    result.created++;
  }

  return result;
}
