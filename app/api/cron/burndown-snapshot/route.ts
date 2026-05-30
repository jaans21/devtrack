import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeSprints = await prisma.sprint.findMany({
    where: { status: "ACTIVE" },
    include: {
      issues: { select: { storyPoints: true, status: true } },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let created = 0;
  for (const sprint of activeSprints) {
    const totalPoints = sprint.issues.reduce((s, i) => s + (i.storyPoints ?? 0), 0);
    const completedPoints = sprint.issues
      .filter((i) => i.status === "DONE")
      .reduce((s, i) => s + (i.storyPoints ?? 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    await prisma.burndownSnapshot.upsert({
      where: { sprintId_date: { sprintId: sprint.id, date: today } },
      create: { sprintId: sprint.id, date: today, totalPoints, completedPoints, remainingPoints },
      update: { totalPoints, completedPoints, remainingPoints },
    });
    created++;
  }

  return NextResponse.json({ ok: true, snapshotsCreated: created });
}
