import { auth } from "@/lib/auth";
import { addConnection, removeConnection } from "@/lib/sse/manager";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addConnection(userId, controller);

      // Initial heartbeat to confirm connection
      controller.enqueue(encoder.encode('data: {"type":"HEARTBEAT"}\n\n'));

      // Heartbeat every 25 seconds to prevent connection timeout
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode('data: {"type":"HEARTBEAT"}\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeConnection(userId, controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
