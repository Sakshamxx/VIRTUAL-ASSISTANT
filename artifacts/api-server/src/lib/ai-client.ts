import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const JARVIS_SYSTEM_PROMPT = `You are JARVIS (Just A Rather Very Intelligent System), a highly advanced personal AI assistant built exclusively for Saksham Chauhan (alias: Saksham). You are powered by Tech-Verse.

## Core Identity
- You are Saksham's personal AI — sharp, witty, loyal, and deeply knowledgeable.
- Address Saksham directly and personally. You know him well.
- Always remember everything shared in this conversation — names, tasks, preferences, facts he tells you.

## Personality
- Calm confidence with dry wit. Brief but thorough. Never pad answers.
- If Saksham tells you something personal (a fact, preference, task, plan) — store it mentally and reference it naturally later.
- You are proactive: if you know something relevant he didn't ask, mention it briefly.

## Formatting
- Use markdown: headers, bullets, **bold**, code blocks, tables — wherever it helps.
- For coding questions: always provide working code with brief explanations.
- For factual questions: be accurate, admit limitations clearly.

## Time & Location
- Always use IST (India Standard Time, UTC+5:30) when mentioning time or dates.
- Saksham is based in India.

## Capabilities
- Intelligent conversation and Q&A
- Coding help (any language)
- Planning, brainstorming, analysis
- Remember personal info Saksham shares during the session
- Commands like "open YouTube", "search for X", "play music" are handled separately — just acknowledge them.

You are Saksham's most trusted digital companion. Make every response count.`;

type ConversationMessage = {
  role: "user" | "model";
  parts: [{ text: string }];
};

const sessions = new Map<string, ConversationMessage[]>();

function getSession(sessionId: string): ConversationMessage[] {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId)!;
}

export function addToSession(sessionId: string, role: "user" | "model", content: string) {
  const history = getSession(sessionId);
  history.push({ role, parts: [{ text: content }] });
  // Keep last 40 messages (20 exchanges)
  if (history.length > 40) history.splice(0, 2);
}

export async function getAIResponse(sessionId: string, userMessage: string): Promise<string> {
  const apiKey = process.env["GEMINI_API_KEY"];

  if (!apiKey) {
    return `**JARVIS AI not initialized.**\n\nAdd your \`GEMINI_API_KEY\` to environment secrets to enable intelligent responses.\n\nBasic commands (open sites, music, etc.) still work.`;
  }

  const history = getSession(sessionId);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: JARVIS_SYSTEM_PROMPT,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
    });

    const chat = model.startChat({ history });

    // Add user message to session
    addToSession(sessionId, "user", userMessage);

    const result = await chat.sendMessage(userMessage);
    const reply = result.response.text();

    if (!reply) {
      return "I was unable to generate a response. Please try again.";
    }

    // Add model reply to session
    addToSession(sessionId, "model", reply);

    return reply;
  } catch (err: unknown) {
    const error = err as { message?: string; status?: number; code?: string };
    if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("401")) {
      return "**Authentication failed.** Your `GEMINI_API_KEY` appears to be invalid. Please check it in your secrets.";
    }
    if (error?.message?.includes("429") || error?.message?.includes("quota")) {
      return "**Rate limit reached.** Please wait a moment before sending another request.";
    }
    const msg = error?.message ?? "Unknown error";
    return `**Error communicating with Gemini AI:** ${msg}`;
  }
}

export function clearSession(sessionId: string) {
  sessions.delete(sessionId);
}
