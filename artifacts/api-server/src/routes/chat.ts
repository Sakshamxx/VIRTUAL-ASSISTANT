import { Router, type IRouter } from "express";
import { db, commandHistoryTable } from "@workspace/db";
import {
  SendChatBody,
  SendChatResponse,
  VoiceCommandBody,
  VoiceCommandResponse,
} from "@workspace/api-zod";
import { processCommand } from "../lib/command-processor.js";
import { v4 as uuidv4 } from "uuid";

const router: IRouter = Router();

const JARVIS_RESPONSES = [
  "I've analyzed your request. Here's what I found.",
  "Processing complete. Here are the results.",
  "Understood. Let me help you with that.",
  "Affirmative. Task completed successfully.",
  "I've processed your query. Here's the information.",
  "Running analysis... complete. Here is my response.",
];

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! I am JARVIS, your AI assistant. All systems are operational and ready to assist you. What can I do for you today?";
  }

  if (lower.includes("who are you") || lower.includes("what are you")) {
    return "I am JARVIS — Just A Rather Very Intelligent System. Your personal AI assistant, built to help you navigate the digital world with intelligence and precision.";
  }

  if (lower.includes("time")) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  }

  if (lower.includes("date") || lower.includes("today")) {
    return `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;
  }

  if (lower.includes("weather")) {
    return "I don't have access to real-time weather data without a weather API key. You can connect one to enable live weather queries.";
  }

  const randomResponse = JARVIS_RESPONSES[Math.floor(Math.random() * JARVIS_RESPONSES.length)];
  return `${randomResponse} Regarding "${message}" — I would need an AI API key (Gemini/OpenAI) to provide intelligent responses. Add your GEMINI_API_KEY or OPENAI_API_KEY to enable full AI capabilities.`;
}

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;
  const reply = getAIResponse(message);
  const now = new Date();
  const session = sessionId ?? uuidv4();

  await db.insert(commandHistoryTable).values({
    type: "chat",
    input: message,
    response: reply,
    action: "ai_chat",
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

  await db.insert(commandHistoryTable).values({
    type: "voice",
    input: command,
    response: result.reply,
    action: result.action,
  });

  res.json(
    VoiceCommandResponse.parse({
      action: result.action,
      reply: result.reply,
      data: result.data ?? null,
      timestamp: now.toISOString(),
    }),
  );
});

export default router;
