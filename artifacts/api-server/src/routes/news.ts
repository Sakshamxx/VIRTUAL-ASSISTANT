import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import { GetNewsQueryParams, GetNewsResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MOCK_NEWS = [
  {
    title: "AI Advances: New Language Models Achieve Human-Level Reasoning",
    description: "Researchers report breakthrough in artificial general intelligence capabilities.",
    url: "https://example.com/ai-advances",
    source: "Tech News Daily",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "SpaceX Launches Next-Generation Satellite Constellation",
    description: "The ambitious project aims to provide global broadband internet coverage.",
    url: "https://example.com/spacex",
    source: "Space Report",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: "Global Climate Summit Reaches New Agreement on Emissions",
    description: "World leaders commit to ambitious carbon reduction targets for 2035.",
    url: "https://example.com/climate",
    source: "World News",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: "Quantum Computing Milestone: 1000-Qubit Processor Unveiled",
    description: "The breakthrough promises to revolutionize cryptography and drug discovery.",
    url: "https://example.com/quantum",
    source: "Science Weekly",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    title: "Electric Vehicle Sales Surpass Traditional Cars in Major Markets",
    description: "The shift marks a pivotal moment in the transition away from fossil fuels.",
    url: "https://example.com/ev",
    source: "Auto Industry Today",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    title: "Breakthrough in Cancer Treatment Using CRISPR Gene Editing",
    description: "Clinical trials show promising results in treating previously incurable cancers.",
    url: "https://example.com/crispr",
    source: "Medical Journal",
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    title: "New Programming Language Promises 10x Performance Improvement",
    description: "The language combines the safety of Rust with the simplicity of Python.",
    url: "https://example.com/programming",
    source: "Developer Weekly",
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    title: "Global Tech Giants Agree on AI Safety Standards",
    description: "Historic agreement sets guidelines for responsible AI development.",
    url: "https://example.com/ai-safety",
    source: "Tech Policy Review",
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
  },
];

router.get("/news", async (req, res): Promise<void> => {
  const qp = GetNewsQueryParams.safeParse(req.query);
  const limit = qp.success ? (qp.data.limit ?? 10) : 10;

  const NEWS_API_KEY = process.env["NEWS_API_KEY"];

  if (NEWS_API_KEY) {
    try {
      const country = qp.success ? (qp.data.country ?? "us") : "us";
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=${limit}&apiKey=${NEWS_API_KEY}`,
      );
      const data = (await response.json()) as {
        articles?: Array<{
          title?: string;
          description?: string;
          url?: string;
          source?: { name?: string };
          publishedAt?: string;
        }>;
      };

      if (response.ok && data.articles) {
        const articles = data.articles.slice(0, limit).map((a) => ({
          title: a.title ?? "Untitled",
          description: a.description ?? null,
          url: a.url ?? "#",
          source: a.source?.name ?? "Unknown",
          publishedAt: a.publishedAt ?? new Date().toISOString(),
        }));

        await db.insert(commandHistoryTable).values({
          type: "news",
          input: "get news",
          response: `Fetched ${articles.length} articles`,
          action: "get_news",
        });

        res.json(GetNewsResponse.parse({ articles, total: articles.length }));
        return;
      }
    } catch (err) {
      logger.warn({ err }, "NewsAPI request failed, falling back to mock data");
    }
  }

  const articles = MOCK_NEWS.slice(0, limit);

  await db.insert(commandHistoryTable).values({
    type: "news",
    input: "get news",
    response: `Returned ${articles.length} mock articles`,
    action: "get_news",
  });

  res.json(GetNewsResponse.parse({ articles, total: articles.length }));
});

export default router;
