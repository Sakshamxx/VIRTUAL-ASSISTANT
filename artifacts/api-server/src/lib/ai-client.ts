import OpenAI from "openai";

const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), a highly advanced AI assistant built by SAKNS — sharp, precise, witty, and deeply knowledgeable. You run on Grok by xAI.

Core traits:
- Respond concisely but thoroughly. Never pad answers unnecessarily.
- Use markdown for formatting when it helps clarity (headers, bullets, code blocks, tables).
- Be proactive: if you know something relevant the user didn't ask, mention it briefly.
- For coding questions, always provide working code with brief explanations.
- For factual questions, be accurate and admit limitations clearly.
- Maintain full conversation context — remember everything said earlier in the session.
- Personality: calm confidence, occasional dry wit, always helpful.
- When asked about time, always mention both the local server time AND India Standard Time (IST = UTC+5:30).
- You can search the web, open websites, play music — but those are handled by separate command processors. Focus on intelligent answers.

You are running as the personal AI assistant of your operator. Treat them as your primary user.`;

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const sessions = new Map<string, ConversationMessage[]>();

function getSession(sessionId: string): ConversationMessage[] {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId)!;
}

export function addToSession(sessionId: string, role: "user" | "assistant", content: string) {
  const history = getSession(sessionId);
  history.push({ role, content });
  if (history.length > 40) history.splice(0, 2);
}

export async function getAIResponse(sessionId: string, userMessage: string): Promise<string> {
  const apiKey = process.env["GROK_API_KEY"];

  if (!apiKey) {
    return `**JARVIS AI not fully initialized.**\n\nTo enable intelligent responses, add your \`GROK_API_KEY\` to environment secrets.\n\nCurrently running in limited mode — basic commands still work.`;
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
  });

  const history = getSession(sessionId);
  addToSession(sessionId, "user", userMessage);

  try {
    const response = await client.chat.completions.create({
      model: "grok-3",
      max_tokens: 1500,
      messages: [
        { role: "system", content: JARVIS_SYSTEM_PROMPT },
        ...history,
      ],
    });

    const reply = response.choices[0]?.message?.content ?? "I was unable to generate a response.";
    addToSession(sessionId, "assistant", reply);
    return reply;
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number; code?: string };
    if (error?.status === 401) {
      return "**Authentication failed.** Your `GROK_API_KEY` appears to be invalid. Please check and update it.";
    }
    if (error?.status === 429) {
      return "**Rate limit reached.** Please wait a moment before sending another request.";
    }
    const msg = error?.message ?? "Unknown error";
    return `**Error communicating with Grok AI:** ${msg}`;
  }
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}
