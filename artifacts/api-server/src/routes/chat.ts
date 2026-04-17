import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import {
  SendChatBody,
  SendChatResponse,
  VoiceCommandBody,
  VoiceCommandResponse,
} from "@workspace/api-zod";
import { processCommand } from "../lib/command-processor.js";
import { getClaudeResponse, addToSession } from "../lib/ai-client.js";
import { v4 as uuidv4 } from "uuid";

const router: IRouter = Router();

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;
  const session = sessionId ?? uuidv4();
  const now = new Date();

  // First check if it's a deterministic command
  const result = processCommand(message);

  let reply: string;
  let action = result.action;

  if (result.action === "ai_chat" || result.reply === "") {
    // Send to Claude
    reply = await getClaudeResponse(session, message);
    action = "ai_chat";
  } else {
    // Use the command processor result and still add to Claude context
    reply = result.reply;
    addToSession(session, "user", message);
    addToSession(session, "assistant", reply);
  }

  await db.insert(commandHistoryTable).values({
    type: "chat",
    input: message,
    response: reply,
    action,
  });

  res.json(
    SendChatResponse.parse({
      reply,
      sessionId: session,
      timestamp: now.toISOString(),
    }),
  );
});

router.post("/voice-command", async (req, res): Promise<void> => {
  const parsed = VoiceCommandBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { command } = parsed.data;
  const result = processCommand(command);
  const now = new Date();

  let reply = result.reply;
  let action = result.action;

  // If command falls through to AI, call Claude
  if (result.action === "ai_chat" || reply === "") {
    const session = uuidv4();
    reply = await getClaudeResponse(session, command);
    action = "ai_chat";
  }

  await db.insert(commandHistoryTable).values({
    type: "voice",
    input: command,
    response: reply,
    action,
  });

  res.json(
    VoiceCommandResponse.parse({
      action,
      reply,
      data: result.data ?? null,
      timestamp: now.toISOString(),
    }),
  );
});

export default router;
