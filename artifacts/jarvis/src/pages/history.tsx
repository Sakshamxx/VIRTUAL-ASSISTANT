import { useGetHistory } from "@workspace/api-client-react";
import { History, MessageSquare, Mic, Music, Newspaper, Loader2, Archive, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const TYPE_CONFIG: Record<string, { icon: typeof MessageSquare; color: string; bg: string }> = {
  chat:  { icon: MessageSquare, color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/30" },
  voice: { icon: Mic,           color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
  music: { icon: Music,         color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
  news:  { icon: Newspaper,     color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  todo:  { icon: ListTodo,      color: "text-pink-400",   bg: "bg-pink-400/10 border-pink-400/30" },
};

export default function HistoryPage() {
  const { data: history, isLoading } = useGetHistory({ limit: 60 });
  const [filter, setFilter] = useState<string>("all");

  const filtered = history?.entries.filter(e => filter === "all" || e.type === filter) || [];
  const types = [...new Set(history?.entries.map(e => e.type) || [])];

  return (
    <div className="space-y-5 pb-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-primary/20 pb-5 shrink-0">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-primary tracking-widest uppercase text-glow flex items-center gap-2">
            <Archive className="w-5 h-5" /> System Logs
          </motion.h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">Full operator activity archive</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-primary/40 uppercase tracking-widest">Records:</span>
          <span className="text-primary font-bold">{String(history?.total || 0).padStart(4, "0")}</span>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 flex-wrap shrink-0">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all ${filter === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
          All ({history?.total || 0})
        </button>
        {types.map(type => {
          const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.chat;
          const count = history?.entries.filter(e => e.type === type).length || 0;
          return (
            <button key={type} onClick={() => setFilter(type)}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all ${filter === type ? `${cfg.bg} ${cfg.color}` : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
              {type} ({count})
            </button>
          );
        })}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-xs font-mono text-primary/50 uppercase tracking-widest animate-pulse">Loading archive...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((entry, i) => {
                const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.chat;
                const Icon = cfg.icon;
                const date = (() => {
                  try {
                    return new Date(entry.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "numeric", month: "short",
                      hour: "2-digit", minute: "2-digit", hour12: true,
                    });
                  } catch { return "—"; }
                })();

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="group flex gap-3 p-3 border border-primary/10 bg-black/40 hover:border-primary/30 hover:bg-black/60 transition-all"
                  >
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 flex items-center justify-center border ${cfg.bg} ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 font-mono">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 border ${cfg.bg} ${cfg.color}`}>{entry.type}</span>
                        {entry.action && entry.action !== "none" && (
                          <span className="text-[9px] uppercase tracking-widest text-primary/40 border border-primary/10 px-1.5 py-0.5">{entry.action}</span>
                        )}
                        <span className="text-[9px] text-muted-foreground/40 ml-auto">{date}</span>
                      </div>
                      <p className="text-xs text-foreground/90 truncate">{entry.input}</p>
                      <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{entry.response}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="border border-dashed border-primary/20 py-16 text-center">
                <History className="w-8 h-8 text-primary/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">No logs recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
