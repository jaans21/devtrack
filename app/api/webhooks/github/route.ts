import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { handleGitHubEvent } from "@/lib/github/webhook-handler";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sig = request.headers.get("x-hub-signature-256") ?? "";
  const event = request.headers.get("x-github-event") ?? "";
  const deliveryId = request.headers.get("x-github-delivery") ?? "";

  const body = await request.text();

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const hmac = createHmac("sha256", secret);
  hmac.update(body);
  const digest = `sha256=${hmac.digest("hex")}`;

  let signatureValid = false;
  try {
    signatureValid =
      sig.length === digest.length &&
      timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!signatureValid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Log the delivery
  const repoId = (payload as { repository?: { id?: number } })?.repository?.id;
  const repo = repoId
    ? await prisma.gitHubRepo.findFirst({ where: { repoId } })
    : null;
  const webhook = repo
    ? await prisma.webhook.findFirst({ where: { workspaceId: repo.connection?.workspaceId ?? "" } })
    : null;

  // Process async — respond immediately to GitHub
  void Promise.resolve().then(async () => {
    try {
      await handleGitHubEvent(event, payload, prisma);
      if (webhook) {
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as object,
            statusCode: 200,
            success: true,
          },
        });
      }
    } catch (err) {
      if (webhook) {
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payload as object,
            statusCode: 500,
            response: err instanceof Error ? err.message : "Unknown error",
            success: false,
          },
        });
      }
    }
  });

  return NextResponse.json({ ok: true, deliveryId });
}
