import { useState, useRef, useEffect } from "react";
import { useSendChat, useVoiceCommand } from "@workspace/api-client-react";
import { useSpeech } from "@/hooks/use-speech";
import {
  Mic, Send, TerminalSquare, MicOff, ExternalLink,
  Music, Globe, Search, Newspaper, Trash2, Bot, User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LocalMessage = {
  id: string;
  role: "user" | "jarvis";
  content: string;
  timestamp: string;
  action?: string;
  actionData?: { url?: string; name?: string; query?: string };
  isVoice?: boolean;
};

const ACTION_BADGES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  open_url:   { label: "OPENED",   icon: <Globe className="w-3 h-3" />,     color: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10" },
  search_web: { label: "SEARCHED", icon: <Search className="w-3 h-3" />,    color: "text-blue-400 border-blue-400/40 bg-blue-400/10" },
  play_music: { label: "PLAYING",  icon: <Music className="w-3 h-3" />,     color: "text-purple-400 border-purple-400/40 bg-purple-400/10" },
  get_news:   { label: "NEWS",     icon: <Newspaper className="w-3 h-3" />, color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
};

const SUGGESTIONS = [
  "What can you remember about me?",
  "Open LinkedIn",
  "Help me plan my day",
  "Search for latest AI news",
  "What's the time in IST?",
  "Explain async/await in JS",
  "Open GitHub",
  "Play Pasoori",
];

export default function Chat() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendChatMut = useSendChat();
  const voiceCommandMut = useVoiceCommand();

  const handleResponse = (
    reply: string,
    newSessionId?: string,
    action?: string,
    data?: Record<string, unknown> | null,
  ) => {
    if (newSessionId) setSessionId(newSessionId);

    const msgAction =
      action && !["ai_chat", "greeting", "time_date", "unknown"].includes(action)
        ? action
        : undefined;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "_j",
        role: "jarvis",
        content: reply,
        timestamp: new Date().toISOString(),
        action: msgAction,
        actionData: data as { url?: string; name?: string; query?: string },
      },
    ]);

    if (["play_music", "open_url", "search_web"].includes(action ?? "")) {
      const url = (data as { url?: string })?.url;
      if (url) setTimeout(() => window.open(url, "_blank"), 300);
    }
  };

  const handleSend = (text?: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const userMsg = (text ?? input).trim();
    if (!userMsg) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + "_u", role: "user", content: userMsg, timestamp: new Date().toISOString() },
    ]);

    sendChatMut.mutate({ data: { message: userMsg, sessionId } }, {
      onSuccess: (data) => handleResponse(data.reply, data.sessionId),
    });
  };

  const { isListening, toggleListening, hasSupport } = useSpeech((transcript) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "_vu",
        role: "user",
        content: transcript,
        timestamp: new Date().toISOString(),
        isVoice: true,
      },
    ]);

    voiceCommandMut.mutate({ data: { command: transcript } }, {
      onSuccess: (data) => handleResponse(data.reply, undefined, data.action, data.data),
    });
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendChatMut.isPending, voiceCommandMut.isPending]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isPending = sendChatMut.isPending || voiceCommandMut.isPending;

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary/15 bg-black/30 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
          <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Gemini · Connected</span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setSessionId(null); }}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/40 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 z-10" ref={scrollRef}>

        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/40 overflow-hidden shadow-[0_0_30px_rgba(0,200,220,0.3)] mx-auto">
                <img src="/avatar.jpeg" alt="JARVIS" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h2 className="text-primary font-bold uppercase tracking-widest text-glow">JARVIS Online</h2>
              <p className="text-muted-foreground text-xs font-mono mt-1">Your personal AI — powered by Google Gemini</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {SUGGESTIONS.map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(s)}
                  className="text-left px-3 py-2.5 text-xs font-mono border border-primary/15 text-primary/50 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {msg.role === "jarvis" ? (
                  <div className="w-7 h-7 rounded-full border border-primary/40 overflow-hidden shadow-[0_0_10px_rgba(0,200,220,0.2)]">
                    <img src="/avatar.jpeg" alt="J" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border border-primary/20 overflow-hidden">
                    <img src="/sakns-avatar.jpeg" alt="You" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className={`max-w-[78%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Label */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    {msg.role === "user" ? (
                      <span className="flex items-center gap-1">
                        SAKNS {msg.isVoice && <Mic className="w-2.5 h-2.5 text-purple-400" />}
                      </span>
                    ) : "J.A.R.V.I.S."}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/25">· {fmtTime(msg.timestamp)}</span>
                </div>

                {/* Bubble */}
                <div className={`text-sm leading-relaxed font-mono px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary/15 border border-primary/40 text-white rounded-tl-xl rounded-bl-xl rounded-br-xl"
                    : "bg-black/70 border border-border/40 text-foreground rounded-tr-xl rounded-br-xl rounded-bl-xl"
                }`}>
                  {msg.role === "jarvis" ? (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-p:my-1.5 prose-p:leading-relaxed
                      prose-ul:my-1.5 prose-li:my-0.5
                      prose-headings:text-primary prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-sm
                      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-black/80 prose-pre:border prose-pre:border-primary/20
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-primary/90
                      prose-table:border-primary/20 prose-th:text-primary prose-th:font-mono">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>

                {/* Action badge */}
                {msg.action && ACTION_BADGES[msg.action] && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border rounded-full ${ACTION_BADGES[msg.action].color}`}>
                    {ACTION_BADGES[msg.action].icon}
                    <span>{ACTION_BADGES[msg.action].label}</span>
                    {msg.actionData?.url && (
                      <a href={msg.actionData.url} target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100">
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {msg.actionData?.name && <span className="opacity-60">{msg.actionData.name}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-full border border-primary/40 overflow-hidden shadow-[0_0_10px_rgba(0,200,220,0.2)] shrink-0 mt-1">
                <img src="/avatar.jpeg" alt="J" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-1">J.A.R.V.I.S. · thinking</span>
                <div className="px-4 py-3 bg-black/70 border border-border/40 rounded-tr-xl rounded-br-xl rounded-bl-xl flex gap-1 items-end h-10">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{ height: ["8px", "20px", "8px"] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="p-4 z-10 border-t border-primary/15 bg-black/60 backdrop-blur-md shrink-0">
        <form onSubmit={(e) => handleSend(undefined, e)} className="flex gap-2.5">
          {hasSupport && (
            <motion.button
              type="button"
              onClick={toggleListening}
              whileTap={{ scale: 0.92 }}
              title={isListening ? "Stop listening" : "Voice input"}
              className={`px-3 border transition-all flex items-center justify-center ${
                isListening
                  ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse"
                  : "border-primary/20 text-primary/40 hover:border-primary hover:text-primary"
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </motion.button>
          )}

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black/70 border border-primary/20 text-white placeholder:text-muted-foreground/40 px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary/60 transition-colors"
              placeholder={isListening ? "Listening..." : "Ask JARVIS anything... (Ctrl+K)"}
              disabled={isPending || isListening}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 items-end h-4">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-0.5 bg-red-400 rounded-full"
                    animate={{ height: ["4px","12px","4px"] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isPending || !input.trim()}
            whileTap={{ scale: 0.95 }}
            className="bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary text-primary px-5 py-3 font-bold tracking-widest uppercase disabled:opacity-20 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-widest">
            Ctrl+K to focus · Voice supported · Full memory this session
          </p>
          <p className="text-[9px] font-mono text-primary/20 uppercase tracking-widest">Gemini 2.0 Flash</p>
        </div>
      </div>
    </div>
  );
}
