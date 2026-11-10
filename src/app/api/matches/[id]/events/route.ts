import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Match from "@/models/Match";
import Innings from "@/models/Innings";
import Delivery from "@/models/Delivery";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const encoder = new TextEncoder();
  let intervalId: any;

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          await connectToDatabase();
          const match = await Match.findById(id)
            .populate("teamA", "name shortName logo primaryColor")
            .populate("teamB", "name shortName logo primaryColor")
            .populate("result.winner", "name shortName");

          if (!match) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Match not found" })}\n\n`));
            return;
          }

          const currentInnings = await Innings.findOne({
            match: id,
            inningsNumber: match.currentInnings,
          })
            .populate("currentStriker", "name jerseyNumber")
            .populate("currentNonStriker", "name jerseyNumber")
            .populate("currentBowler", "name jerseyNumber")
            .populate("battingScorecard.player", "name")
            .populate("bowlingScorecard.player", "name");

          const recentDeliveries = await Delivery.find({ match: id, isUndone: false })
            .sort({ createdAt: -1 })
            .limit(12);

          const payload = {
            match,
            currentInnings,
            recentDeliveries,
            timestamp: Date.now(),
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err: any) {
          console.error("SSE Poll error:", err.message);
        }
      };

      // Send initial data immediately
      await sendUpdate();

      // Poll every 2.5 seconds
      intervalId = setInterval(sendUpdate, 2500);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

