import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import { GetNewsQueryParams, GetNewsResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const MOCK_NEWS = [
  {
    title: "AI Advances: New Language Models Achieve Human-Level Reasoning",
    description: "Researchers report breakthrough in artificial general intelligence capabilities.",
    url: "https://techcrunch.com",
    source: "Tech News Daily",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "SpaceX Launches Next-Generation Satellite Constellation",
    description: "The ambitious project aims to provide global broadband internet coverage.",
    url: "https://space.com",
    source: "Space Report",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    title: "Global Climate Summit Reaches New Agreement on Emissions",
    description: "World leaders commit to ambitious carbon reduction targets for 2035.",
    url: "https://bbc.com/news",
    source: "World News",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    title: "Quantum Computing Milestone: 1000-Qubit Processor Unveiled",
    description: "The breakthrough promises to revolutionize cryptography and drug discovery.",
    url: "https://scientificamerican.com",
    source: "Science Weekly",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    title: "Electric Vehicle Sales Surpass Traditional Cars in Major Markets",
    description: "The shift marks a pivotal moment in the transition away from fossil fuels.",
    url: "https://reuters.com",
    source: "Auto Industry Today",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    title: "Breakthrough in Cancer Treatment Using CRISPR Gene Editing",
    description: "Clinical trials show promising results in treating previously incurable cancers.",
    url: "https://nature.com",
    source: "Medical Journal",
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    title: "India Tech Startups Raise Record Funding in Q1 2025",
    description: "Indian startups attracted over $5 billion in venture capital this quarter.",
    url: "https://economictimes.com",
    source: "Economic Times",
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    title: "Global Tech Giants Agree on AI Safety Standards",
    description: "Historic agreement sets guidelines for responsible AI development worldwide.",
    url: "https://wired.com",
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
      // NewsData.io API (pub_ prefix keys)
      const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&language=en&country=in,us&size=${Math.min(limit, 10)}`;
      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: string;
        results?: Array<{
          title?: string;
          description?: string | null;
          content?: string | null;
          link?: string;
          source_name?: string;
          pubDate?: string;
          image_url?: string | null;
        }>;
        message?: string;
      };

      if (response.ok && data.status === "success" && data.results && data.results.length > 0) {
        const articles = data.results.slice(0, limit).map((a) => ({
          title: a.title ?? "Untitled",
          description: a.description ?? a.content?.slice(0, 200) ?? null,
          url: a.link ?? "#",
          source: a.source_name ?? "Unknown",
          publishedAt: a.pubDate ? new Date(a.pubDate).toISOString() : new Date().toISOString(),
        }));

        await db.insert(commandHistoryTable).values({
          type: "news",
          input: "get news",
          response: `Fetched ${articles.length} live articles from NewsData.io`,
          action: "get_news",
        });

        res.json(GetNewsResponse.parse({ articles, total: articles.length }));
        return;
      }

      if (data.message) {
        logger.warn({ msg: data.message }, "NewsData.io returned an error message");
      }
    } catch (err) {
      logger.warn({ err }, "NewsData.io request failed, falling back to mock data");
    }
  }

  // Fallback to mock data
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
