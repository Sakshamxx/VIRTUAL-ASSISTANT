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
  x: { url: "https://x.com", name: "X (Twitter)" },
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
  "google docs": { url: "https://docs.google.com", name: "Google Docs" },
  sheets: { url: "https://sheets.google.com", name: "Google Sheets" },
  "google sheets": { url: "https://sheets.google.com", name: "Google Sheets" },
  slides: { url: "https://slides.google.com", name: "Google Slides" },
  calendar: { url: "https://calendar.google.com", name: "Google Calendar" },
  "google calendar": { url: "https://calendar.google.com", name: "Google Calendar" },
  meet: { url: "https://meet.google.com", name: "Google Meet" },
  "google meet": { url: "https://meet.google.com", name: "Google Meet" },
  netflix: { url: "https://netflix.com", name: "Netflix" },
  spotify: { url: "https://open.spotify.com", name: "Spotify" },
  amazon: { url: "https://amazon.in", name: "Amazon" },
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
  tiktok: { url: "https://tiktok.com", name: "TikTok" },
  zoom: { url: "https://zoom.us", name: "Zoom" },
  teams: { url: "https://teams.microsoft.com", name: "Microsoft Teams" },
  outlook: { url: "https://outlook.live.com", name: "Outlook" },
  onedrive: { url: "https://onedrive.live.com", name: "OneDrive" },
  word: { url: "https://office.live.com/start/Word.aspx", name: "Microsoft Word" },
  excel: { url: "https://office.live.com/start/Excel.aspx", name: "Microsoft Excel" },
  powerpoint: { url: "https://office.live.com/start/PowerPoint.aspx", name: "PowerPoint" },
  trello: { url: "https://trello.com", name: "Trello" },
  canva: { url: "https://canva.com", name: "Canva" },
  leetcode: { url: "https://leetcode.com", name: "LeetCode" },
  hackerrank: { url: "https://hackerrank.com", name: "HackerRank" },
  coursera: { url: "https://coursera.org", name: "Coursera" },
  udemy: { url: "https://udemy.com", name: "Udemy" },
  "khan academy": { url: "https://khanacademy.org", name: "Khan Academy" },
  bbc: { url: "https://bbc.com/news", name: "BBC News" },
  cnn: { url: "https://cnn.com", name: "CNN" },
  paypal: { url: "https://paypal.com", name: "PayPal" },
  paytm: { url: "https://paytm.com", name: "Paytm" },
  snapchat: { url: "https://snapchat.com", name: "Snapchat" },
  jira: { url: "https://www.atlassian.com/software/jira", name: "Jira" },
  "vs code": { url: "https://vscode.dev", name: "VS Code (Web)" },
  vscode: { url: "https://vscode.dev", name: "VS Code (Web)" },
  "google news": { url: "https://news.google.com", name: "Google News" },
};

function matchSite(cmd: string): { url: string; name: string } | null {
  const sorted = Object.entries(SITE_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [key, val] of sorted) {
    if (cmd.includes(key)) return val;
  }
  return null;
}

function getISTTime(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getISTDate(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function processCommand(command: string): CommandResult {
  const cmd = command.toLowerCase().trim();

  // ── Time ──────────────────────────────────────────────────────────────────
  if (cmd.match(/\b(what(?:'s| is) the time|current time|time now|what time|time in india|ist time)\b/)) {
    const istTime = getISTTime();
    return {
      action: "time_date",
      reply: `🕐 Current time in **India (IST)**: **${istTime}**`,
    };
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  if (cmd.match(/\b(what(?:'s| is) (?:today'?s? )?date|today(?:'s date)?|what day|current date)\b/)) {
    const istDate = getISTDate();
    return {
      action: "time_date",
      reply: `📅 Today in **India (IST)**: **${istDate}**`,
    };
  }

  // ── Open URL ──────────────────────────────────────────────────────────────
  if (cmd.match(/^(open|launch|go to|navigate to|show me)\s+/)) {
    const after = cmd.replace(/^(open|launch|go to|navigate to|show me)\s+/, "").trim();
    const site = matchSite(after);
    if (site) {
      return {
        action: "open_url",
        reply: `Opening **${site.name}** for you.`,
        data: { url: site.url, name: site.name },
      };
    }
    if (after.match(/\.(com|org|net|io|in|co|dev|app)/)) {
      const url = after.startsWith("http") ? after : `https://${after}`;
      return {
        action: "open_url",
        reply: `Opening **${after}**.`,
        data: { url, name: after },
      };
    }
  }

  // ── Web Search ────────────────────────────────────────────────────────────
  const googleSearch = cmd.match(/^(?:search|google|look up|find|search for|search on google|search google for)\s+(.+)$/);
  if (googleSearch) {
    const query = googleSearch[1];
    return {
      action: "search_web",
      reply: `Searching Google for **"${query}"**.`,
      data: { url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, query },
    };
  }

  const ytSearch = cmd.match(/^(?:search on youtube|youtube search|search youtube(?:\s+for)?|find on youtube)\s+(.+)$/);
  if (ytSearch) {
    const query = ytSearch[1];
    return {
      action: "search_web",
      reply: `Searching YouTube for **"${query}"**.`,
      data: { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, query },
    };
  }

  // ── Play Music ────────────────────────────────────────────────────────────
  if (cmd.startsWith("play ")) {
    const songName = cmd.replace(/^play\s+/i, "").trim();
    const url = musicLibrary[songName];
    if (url) {
      return { action: "play_music", reply: `Playing **${songName}**.`, data: { songName, url } };
    }
    const fuzzy = Object.keys(musicLibrary).find(k => k.includes(songName) || songName.includes(k));
    if (fuzzy) {
      return { action: "play_music", reply: `Playing **${fuzzy}**.`, data: { songName: fuzzy, url: musicLibrary[fuzzy] } };
    }
    return { action: "play_music", reply: `I couldn't find **"${songName}"** in the library. Check the AUDIO section for available songs.`, data: { songName, found: false } };
  }

  // ── News ──────────────────────────────────────────────────────────────────
  if (cmd.match(/\b(news|headlines|what(?:'s| is) happening|latest updates?)\b/)) {
    return { action: "get_news", reply: "Fetching the latest news headlines for you." };
  }

  // ── Greetings ─────────────────────────────────────────────────────────────
  if (cmd.match(/^(hi|hello|hey|good morning|good evening|good afternoon|wassup|sup|what'?s up|namaste)\b/)) {
    const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return { action: "greeting", reply: `${greeting}, sir. All systems operational. How may I assist you today?` };
  }

  if (cmd.match(/\bhow are you\b/)) {
    return { action: "greeting", reply: "All systems nominal, operating at peak efficiency. Ready to assist." };
  }

  // ── Fallthrough to Grok AI ────────────────────────────────────────────────
  return { action: "ai_chat", reply: "" };
}
