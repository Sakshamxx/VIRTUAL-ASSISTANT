import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import { PlayMusicBody, PlayMusicResponse, GetMusicLibraryResponse } from "@workspace/api-zod";
import { musicLibrary } from "../lib/music-library.js";

const router: IRouter = Router();

router.post("/play-music", async (req, res): Promise<void> => {
  const parsed = PlayMusicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { songName } = parsed.data;
  const key = songName.toLowerCase().trim();
  const url = musicLibrary[key];

  if (!url) {
    res.status(404).json({ error: `Song "${songName}" not found in library` });
    return;
  }

  await db.insert(commandHistoryTable).values({
    type: "music",
    input: songName,
    response: `Playing ${songName}`,
    action: "play_music",
  });

  res.json(
    PlayMusicResponse.parse({
      songName,
      url,
      found: true,
    }),
  );
});

router.get("/music/library", async (_req, res): Promise<void> => {
  const songs = Object.entries(musicLibrary).map(([name, url]) => ({ name, url }));

  res.json(
    GetMusicLibraryResponse.parse({
      songs,
      total: songs.length,
    }),
  );
});

export default router;
