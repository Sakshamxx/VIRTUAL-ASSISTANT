import { musicLibrary } from "./music-library.js";

export type CommandAction =
  | "open_url"
  | "play_music"
  | "get_news"
  | "ai_chat"
  | "greeting"
  | "unknown";

export interface CommandResult {
  action: CommandAction;
  reply: string;
  data?: Record<string, unknown>;
}

export function processCommand(command: string): CommandResult {
  const cmd = command.toLowerCase().trim();

  if (cmd.includes("open google")) {
    return {
      action: "open_url",
      reply: "Opening Google for you.",
      data: { url: "https://google.com" },
    };
  }

  if (cmd.includes("open youtube")) {
    return {
      action: "open_url",
      reply: "Opening YouTube.",
      data: { url: "https://youtube.com" },
    };
  }

  if (cmd.includes("open facebook")) {
    return {
      action: "open_url",
      reply: "Opening Facebook.",
      data: { url: "https://facebook.com" },
    };
  }

  if (cmd.includes("open linkedin")) {
    return {
      action: "open_url",
      reply: "Opening LinkedIn.",
      data: { url: "https://linkedin.com" },
    };
  }

  if (
    cmd.includes("how are you") ||
    cmd.includes("ssup") ||
    cmd.includes("sup") ||
    cmd.includes("how are you doing")
  ) {
    return {
      action: "greeting",
      reply: "I am well, thank you for asking. All systems operational.",
    };
  }

  if (cmd.startsWith("play")) {
    const songName = cmd.replace(/^play\s*/i, "").trim();
    const url = musicLibrary[songName];
    if (url) {
      return {
        action: "play_music",
        reply: `Playing ${songName} for you.`,
        data: { songName, url },
      };
    }
    return {
      action: "play_music",
      reply: `Sorry, I couldn't find "${songName}" in the library. Try one of the available songs.`,
      data: { songName, found: false },
    };
  }

  if (cmd.includes("news")) {
    return {
      action: "get_news",
      reply: "Fetching the latest news headlines for you.",
    };
  }

  return {
    action: "ai_chat",
    reply: "Let me process that with AI.",
  };
}
