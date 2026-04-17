import { musicLibrary } from "./music-library.js";

export type CommandAction =
  | "open_url"
  | "play_music"
  | "get_news"
  | "ai_chat"
  | "greeting"
  | "time_date"
  | "search_web"
  | "unknown";

export interface CommandResult {
  action: CommandAction;
  reply: string;
  data?: Record<string, unknown>;
}

const SITE_MAP: Record<string, { url: string; name: string }> = {
  google: { url: "https://google.com", name: "Google" },
  youtube: { url: "https://youtube.com", name: "YouTube" },
  facebook: { url: "https://facebook.com", name: "Facebook" },
  linkedin: { url: "https://linkedin.com", name: "LinkedIn" },
  twitter: { url: "https://twitter.com", name: "Twitter" },
  x: { url: "https://x.com", name: "X" },
  instagram: { url: "https://instagram.com", name: "Instagram" },
  reddit: { url: "https://reddit.com", name: "Reddit" },
  github: { url: "https://github.com", name: "GitHub" },
  gmail: { url: "https://mail.google.com", name: "Gmail" },
  mail: { url: "https://mail.google.com", name: "Gmail" },
  email: { url: "https://mail.google.com", name: "Gmail" },
  maps: { url: "https://maps.google.com", name: "Google Maps" },
  "google maps": { url: "https://maps.google.com", name: "Google Maps" },
  drive: { url: "https://drive.google.com", name: "Google Drive" },
  "google drive": { url: "https://drive.google.com", name: "Google Drive" },
  docs: { url: "https://docs.google.com", name: "Google Docs" },
  sheets: { url: "https://sheets.google.com", name: "Google Sheets" },
  slides: { url: "https://slides.google.com", name: "Google Slides" },
  calendar: { url: "https://calendar.google.com", name: "Google Calendar" },
  "google calendar": { url: "https://calendar.google.com", name: "Google Calendar" },
  meet: { url: "https://meet.google.com", name: "Google Meet" },
  netflix: { url: "https://netflix.com", name: "Netflix" },
  spotify: { url: "https://spotify.com", name: "Spotify" },
  amazon: { url: "https://amazon.com", name: "Amazon" },
  flipkart: { url: "https://flipkart.com", name: "Flipkart" },
  whatsapp: { url: "https://web.whatsapp.com", name: "WhatsApp" },
  telegram: { url: "https://web.telegram.org", name: "Telegram" },
  discord: { url: "https://discord.com/app", name: "Discord" },
  slack: { url: "https://slack.com", name: "Slack" },
  notion: { url: "https://notion.so", name: "Notion" },
  figma: { url: "https://figma.com", name: "Figma" },
  stackoverflow: { url: "https://stackoverflow.com", name: "Stack Overflow" },
  "stack overflow": { url: "https://stackoverflow.com", name: "Stack Overflow" },
  medium: { url: "https://medium.com", name: "Medium" },
  wikipedia: { url: "https://wikipedia.org", name: "Wikipedia" },
  chatgpt: { url: "https://chatgpt.com", name: "ChatGPT" },
  claude: { url: "https://claude.ai", name: "Claude" },
  replit: { url: "https://replit.com", name: "Replit" },
  twitch: { url: "https://twitch.tv", name: "Twitch" },
  pinterest: { url: "https://pinterest.com", name: "Pinterest" },
  snapchat: { url: "https://snapchat.com", name: "Snapchat" },
  tiktok: { url: "https://tiktok.com", name: "TikTok" },
  zoom: { url: "https://zoom.us", name: "Zoom" },
  teams: { url: "https://teams.microsoft.com", name: "Microsoft Teams" },
  outlook: { url: "https://outlook.live.com", name: "Outlook" },
  onedrive: { url: "https://onedrive.live.com", name: "OneDrive" },
  word: { url: "https://office.live.com/start/Word.aspx", name: "Microsoft Word" },
  excel: { url: "https://office.live.com/start/Excel.aspx", name: "Microsoft Excel" },
  powerpoint: { url: "https://office.live.com/start/PowerPoint.aspx", name: "Microsoft PowerPoint" },
  trello: { url: "https://trello.com", name: "Trello" },
  jira: { url: "https://www.atlassian.com/software/jira", name: "Jira" },
  canva: { url: "https://canva.com", name: "Canva" },
  "leetcode": { url: "https://leetcode.com", name: "LeetCode" },
  "hackerrank": { url: "https://hackerrank.com", name: "HackerRank" },
  "codeforces": { url: "https://codeforces.com", name: "Codeforces" },
  "coursera": { url: "https://coursera.org", name: "Coursera" },
  "udemy": { url: "https://udemy.com", name: "Udemy" },
  "khan academy": { url: "https://khanacademy.org", name: "Khan Academy" },
  "news": { url: "https://news.google.com", name: "Google News" },
  "bbc": { url: "https://bbc.com/news", name: "BBC News" },
  "cnn": { url: "https://cnn.com", name: "CNN" },
  "paypal": { url: "https://paypal.com", name: "PayPal" },
};

function matchSite(cmd: string): { url: string; name: string } | null {
  for (const [key, val] of Object.entries(SITE_MAP)) {
    if (cmd.includes(key)) return val;
  }
  return null;
}

export function processCommand(command: string): CommandResult {
  const cmd = command.toLowerCase().trim();

  // ── Time / Date ──────────────────────────────────────────────────────────
  if (cmd.match(/\b(what(?:'s| is) the time|current time|time now|what time)\b/)) {
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return { action: "time_date", reply: `The current time is **${time}**.` };
  }

  if (cmd.match(/\b(what(?:'s| is) (?:today'?s? )?date|today(?:'s date)?|what day)\b/)) {
    const date = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return { action: "time_date", reply: `Today is **${date}**.` };
  }

  // ── Open URL ─────────────────────────────────────────────────────────────
  if (cmd.startsWith("open ") || cmd.startsWith("launch ") || cmd.startsWith("go to ") || cmd.startsWith("navigate to ")) {
    const after = cmd.replace(/^(open|launch|go to|navigate to)\s+/, "").trim();
    const site = matchSite(after);
    if (site) {
      return {
        action: "open_url",
        reply: `Opening **${site.name}** for you.`,
        data: { url: site.url, name: site.name },
      };
    }
    // Try opening as a URL directly
    if (after.includes(".com") || after.includes(".org") || after.includes(".net") || after.includes(".io")) {
      const url = after.startsWith("http") ? after : `https://${after}`;
      return {
        action: "open_url",
        reply: `Opening **${after}** for you.`,
        data: { url, name: after },
      };
    }
  }

  // ── Web Search ────────────────────────────────────────────────────────────
  const searchMatch = cmd.match(/^(?:search|google|look up|find|search for|search on google|search google for)\s+(.+)$/);
  if (searchMatch) {
    const query = searchMatch[1];
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return {
      action: "search_web",
      reply: `Searching Google for **"${query}"**.`,
      data: { url, query },
    };
  }

  const ytSearchMatch = cmd.match(/^(?:search on youtube|youtube search|search youtube for|youtube|find on youtube)\s+(.+)$/);
  if (ytSearchMatch) {
    const query = ytSearchMatch[1];
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    return {
      action: "search_web",
      reply: `Searching YouTube for **"${query}"**.`,
      data: { url, query },
    };
  }

  // ── Play Music ────────────────────────────────────────────────────────────
  if (cmd.startsWith("play")) {
    const songName = cmd.replace(/^play\s*/i, "").trim();
    const url = musicLibrary[songName];
    if (url) {
      return {
        action: "play_music",
        reply: `Playing **${songName}** for you.`,
        data: { songName, url },
      };
    }
    // Try fuzzy match
    const fuzzyMatch = Object.keys(musicLibrary).find(k => k.includes(songName) || songName.includes(k));
    if (fuzzyMatch) {
      return {
        action: "play_music",
        reply: `Playing **${fuzzyMatch}** for you.`,
        data: { songName: fuzzyMatch, url: musicLibrary[fuzzyMatch] },
      };
    }
    return {
      action: "play_music",
      reply: `I couldn't find **"${songName}"** in the library. Try checking the AUDIO section for available songs.`,
      data: { songName, found: false },
    };
  }

  // ── News ──────────────────────────────────────────────────────────────────
  if (cmd.match(/\b(news|headlines|what(?:'s| is) happening|latest)\b/)) {
    return {
      action: "get_news",
      reply: "Fetching the latest news headlines for you.",
    };
  }

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (cmd.match(/^(hi|hello|hey|good morning|good evening|good afternoon|wassup|sup|what'?s up)\b/)) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return {
      action: "greeting",
      reply: `${greeting}, sir. All systems are fully operational. How may I assist you today?`,
    };
  }

  if (cmd.match(/\bhow are you\b/)) {
    return {
      action: "greeting",
      reply: "All systems nominal, operating at peak efficiency. Ready to assist.",
    };
  }

  // ── Fallthrough to Claude AI ───────────────────────────────────────────────
  return {
    action: "ai_chat",
    reply: "",
  };
}
