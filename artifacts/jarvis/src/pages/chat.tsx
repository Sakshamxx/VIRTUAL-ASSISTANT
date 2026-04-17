import { useState, useRef, useEffect } from "react";
import { useSendChat, useVoiceCommand } from "@workspace/api-client-react";
import { useSpeech } from "@/hooks/use-speech";
import { Mic, Send, TerminalSquare, MicOff, ExternalLink, Music, Globe, Search, Newspaper } from "lucide-react";
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
  open_url: { label: "OPENED", icon: <Globe className="w-3 h-3" />, color: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10" },
  search_web: { label: "SEARCHED", icon: <Search className="w-3 h-3" />, color: "text-blue-400 border-blue-400/40 bg-blue-400/10" },
  play_music: { label: "PLAYING", icon: <Music className="w-3 h-3" />, color: "text-purple-400 border-purple-400/40 bg-purple-400/10" },
  get_news: { label: "NEWS", icon: <Newspaper className="w-3 h-3" />, color: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
};

const SUGGESTIONS = [
  "Open LinkedIn",
  "Search for latest AI news",
  "What is quantum computing?",
  "Open GitHub",
  "Play Pasoori",
  "What time is it?",
  "Explain React hooks",
  "Open YouTube",
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

    const msgAction = action && action !== "ai_chat" && action !== "greeting" && action !== "time_date" && action !== "unknown" ? action : undefined;

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

    if (action === "play_music" || action === "open_url" || action === "search_web") {
      const url = (data as { url?: string })?.url;
      if (url) {
        setTimeout(() => window.open(url, "_blank"), 300);
      }
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

  // Ctrl+K to focus input
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

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <TerminalSquare className="w-64 h-64" />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 z-10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <TerminalSquare className="w-12 h-12 text-primary mb-4 opacity-50" />
            <p className="uppercase tracking-widest font-bold opacity-50">Comms Channel Open</p>
            <p className="text-sm font-mono mt-2 text-muted-foreground">Ask me anything or give a command.</p>
            <div className="mt-8 grid grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left px-3 py-2 text-xs font-mono border border-primary/20 text-primary/60 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[82%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-primary/40 font-mono mb-1 tracking-widest uppercase flex items-center gap-1">
                  {msg.role === "user" ? (
                    <>Operator {msg.isVoice && <Mic className="w-2.5 h-2.5" />}</>
                  ) : "J.A.R.V.I.S."}
                  {" // "}
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>

                <div
                  className={`px-4 py-3 text-sm font-mono leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/20 border border-primary/50 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg"
                      : "bg-black/60 border border-border text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg"
                  }`}
                >
                  {msg.role === "jarvis" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-pre:bg-black/80 prose-pre:border prose-pre:border-primary/20 prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>

                {/* Action badge + link */}
                {msg.action && ACTION_BADGES[msg.action] && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border rounded-full ${ACTION_BADGES[msg.action].color}`}>
                    {ACTION_BADGES[msg.action].icon}
                    <span>{ACTION_BADGES[msg.action].label}</span>
                    {msg.actionData?.url && (
                      <a
                        href={msg.actionData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="opacity-70 hover:opacity-100"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {msg.actionData?.name && (
                      <span className="opacity-70">{msg.actionData.name}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-primary/40 font-mono mb-1 tracking-widest uppercase">J.A.R.V.I.S. // processing</span>
                <div className="px-4 py-3 bg-black/60 border border-border rounded-tr-lg rounded-br-lg rounded-bl-lg flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-4 bg-primary animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="p-4 z-10 border-t border-primary/20 bg-black/50 backdrop-blur-md">
        <form onSubmit={(e) => handleSend(undefined, e)} className="flex gap-3">
          {hasSupport && (
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={`px-3 border transition-all flex items-center justify-center ${
                isListening
                  ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse"
                  : "border-primary/30 text-primary/50 hover:border-primary hover:text-primary"
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black/80 border border-primary/30 text-white placeholder:text-muted-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder={isListening ? "Listening..." : "Ask anything or say 'open LinkedIn'... (Ctrl+K)"}
              disabled={isPending || isListening}
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="bg-primary/20 hover:bg-primary/40 border border-primary text-primary px-5 py-3 font-bold tracking-widest uppercase disabled:opacity-30 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 text-[10px] font-mono text-muted-foreground/40 px-1">
          Say "open LinkedIn", "search React tutorials", "play Pasoori", or ask anything.
        </div>
      </div>
    </div>
  );
}
