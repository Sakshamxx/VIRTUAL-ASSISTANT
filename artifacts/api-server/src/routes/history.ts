import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import { desc, sql, count } from "drizzle-orm";
import { GetHistoryQueryParams, GetHistoryResponse, GetActivityStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/history", async (req, res): Promise<void> => {
  const qp = GetHistoryQueryParams.safeParse(req.query);
  const limit = qp.success ? (qp.data.limit ?? 50) : 50;

  const entries = await db
    .select()
    .from(commandHistoryTable)
    .orderBy(desc(commandHistoryTable.createdAt))
    .limit(limit);

  const [{ total }] = await db
    .select({ total: count() })
    .from(commandHistoryTable);

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
  const [{ totalCommands }] = await db
    .select({ totalCommands: count() })
    .from(commandHistoryTable);

  const [{ totalChats }] = await db
    .select({ totalChats: count() })
    .from(commandHistoryTable)
    .where(sql`${commandHistoryTable.type} = 'chat'`);

  const [{ totalVoice }] = await db
    .select({ totalVoice: count() })
    .from(commandHistoryTable)
    .where(sql`${commandHistoryTable.type} = 'voice'`);

  const [{ totalMusic }] = await db
    .select({ totalMusic: count() })
    .from(commandHistoryTable)
    .where(sql`${commandHistoryTable.type} = 'music'`);

  const [{ totalNews }] = await db
    .select({ totalNews: count() })
    .from(commandHistoryTable)
    .where(sql`${commandHistoryTable.type} = 'news'`);

  const actionCounts = await db
    .select({
      action: commandHistoryTable.action,
      count: count(),
    })
    .from(commandHistoryTable)
    .groupBy(commandHistoryTable.action)
    .orderBy(desc(count()))
    .limit(5);

  res.json(
    GetActivityStatsResponse.parse({
      totalCommands,
      totalChats,
      totalVoiceCommands: totalVoice,
      totalMusicPlayed: totalMusic,
      totalNewsRequests: totalNews,
      mostUsedCommands: actionCounts
        .filter((a) => a.action != null)
        .map((a) => ({ action: a.action!, count: a.count })),
    }),
  );
});

export default router;
