import { Router, type IRouter } from "express";
import { historyStore } from "@workspace/db";
import { GetHistoryQueryParams, GetHistoryResponse, GetActivityStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const qp = GetHistoryQueryParams.safeParse(req.query);
  const limit = qp.success ? (qp.data.limit ?? 50) : 50;

  const entries = historyStore.getRecent(limit);
  const total = historyStore.count();

  res.json(
    GetHistoryResponse.parse({
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        input: e.input,
        response: e.response,
        action: e.action ?? null,
        createdAt: e.createdAt.toISOString(),
      })),
      total,
    }),
  );
});

router.get("/history/stats", async (_req, res): Promise<void> => {
  const totalCommands = historyStore.count();
  const totalChats = historyStore.countByType("chat");
  const totalVoice = historyStore.countByType("voice");
  const totalMusic = historyStore.countByType("music");
  const totalNews = historyStore.countByType("news");
  const actionCounts = historyStore.topActions(5);

  res.json(
    GetActivityStatsResponse.parse({
      totalCommands,
      totalChats,
      totalVoiceCommands: totalVoice,
      totalMusicPlayed: totalMusic,
      totalNewsRequests: totalNews,
      mostUsedCommands: actionCounts,
    }),
  );
});

export default router;
