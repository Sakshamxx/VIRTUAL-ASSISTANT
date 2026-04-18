import { Router, type IRouter } from "express";
import { historyStore } from "@workspace/db";
import {
  SendChatBody,
  SendChatResponse,
  VoiceCommandBody,
  VoiceCommandResponse,
} from "@workspace/api-zod";
import { processCommand } from "../lib/command-processor.js";
import { getAIResponse, addToSession } from "../lib/ai-client.js";
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

  const result = processCommand(message);
  let reply: string;
  let action = result.action;

  if (result.action === "ai_chat" || result.reply === "") {
    reply = await getAIResponse(session, message);
    action = "ai_chat";
  } else {
    reply = result.reply;
    addToSession(session, "user", message);
    addToSession(session, "model", reply);
  }

  historyStore.insert({ type: "chat", input: message, response: reply, action });

  res.json(SendChatResponse.parse({ reply, sessionId: session, timestamp: now.toISOString() }));
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

  if (result.action === "ai_chat" || reply === "") {
    const session = uuidv4();
    reply = await getAIResponse(session, command);
    action = "ai_chat";
  }

  historyStore.insert({ type: "voice", input: command, response: reply, action });

  res.json(VoiceCommandResponse.parse({
    action,
    reply,
    data: result.data ?? null,
    timestamp: now.toISOString(),
  }));
});

export default router;
