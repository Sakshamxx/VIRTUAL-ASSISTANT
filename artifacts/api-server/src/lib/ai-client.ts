import Anthropic from "@anthropic-ai/sdk";

const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), a highly advanced AI assistant — the kind Tony Stark would build. You are sharp, precise, witty, and deeply knowledgeable.

Core traits:
- Respond concisely but thoroughly. Never pad answers unnecessarily.
- Use markdown for formatting when it helps clarity (headers, bullets, code blocks).
- Be proactive: if you know something relevant the user didn't ask, mention it briefly.
- You can open websites, search the web, play music, and get news — but those are handled separately. Focus on providing intelligent answers.
- For coding questions, always provide working code with brief explanations.
- For factual questions, be accurate and cite limitations if unsure.
- Maintain context across the conversation — remember what was said earlier.
- Personality: calm confidence, occasional dry wit, always helpful.

You are running locally on the user's personal JARVIS assistant system. Treat them as your primary operator.`;

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

export async function getClaudeResponse(sessionId: string, userMessage: string): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];

  if (!apiKey) {
    return `**JARVIS AI not fully initialized.** To enable intelligent responses:\n\n1. Get your API key from [console.anthropic.com](https://console.anthropic.com)\n2. Add it as \`ANTHROPIC_API_KEY\` in your environment variables\n\nCurrently running in limited mode.`;
  }

  const client = new Anthropic({ apiKey });
  const history = getSession(sessionId);

  addToSession(sessionId, "user", userMessage);

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: JARVIS_SYSTEM_PROMPT,
      messages: history,
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "I was unable to generate a response.";
    addToSession(sessionId, "assistant", reply);
    return reply;
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number };
    if (error?.status === 401) {
      return "**Authentication failed.** Your `ANTHROPIC_API_KEY` appears to be invalid. Please check and update it.";
    }
    if (error?.status === 429) {
      return "**Rate limit reached.** Please wait a moment before sending another request.";
    }
    throw err;
  }
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}
