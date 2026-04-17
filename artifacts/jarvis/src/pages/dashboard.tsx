import { useGetActivityStats, useHealthCheck } from "@workspace/api-client-react";
import { Activity, Zap, Command, MessageSquare, Mic, Music, Newspaper, Globe, Github, Youtube, BookOpen, Search, ExternalLink } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

function useISTClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { time, date };
}

const QUICK_LINKS = [
  { name: "LinkedIn", icon: "in", url: "https://linkedin.com", color: "text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:border-blue-400/60" },
  { name: "GitHub", icon: <Github className="w-5 h-5" />, url: "https://github.com", color: "text-white border-white/20 hover:bg-white/10 hover:border-white/40" },
  { name: "YouTube", icon: <Youtube className="w-5 h-5" />, url: "https://youtube.com", color: "text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400/60" },
  { name: "Drive", icon: "▲", url: "https://drive.google.com", color: "text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10 hover:border-yellow-400/60" },
  { name: "Gmail", icon: "✉", url: "https://mail.google.com", color: "text-red-300 border-red-300/30 hover:bg-red-300/10 hover:border-red-300/60" },
  { name: "Notion", icon: "N", url: "https://notion.so", color: "text-primary border-primary/30 hover:bg-primary/10 hover:border-primary/60" },
  { name: "Spotify", icon: "♪", url: "https://open.spotify.com", color: "text-green-400 border-green-400/30 hover:bg-green-400/10 hover:border-green-400/60" },
  { name: "WhatsApp", icon: "W", url: "https://web.whatsapp.com", color: "text-green-300 border-green-300/30 hover:bg-green-300/10 hover:border-green-300/60" },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetActivityStats();
  const { data: health } = useHealthCheck({ query: { refetchInterval: 15000 } });
  const { time, date } = useISTClock();
  const [, navigate] = useLocation();

  const chartData = stats ? [
    { name: "Chat", value: stats.totalChats },
    { name: "Voice", value: stats.totalVoiceCommands },
    { name: "Music", value: stats.totalMusicPlayed },
    { name: "News", value: stats.totalNewsRequests },
  ] : [];

  return (
    <div className="space-y-5 pb-6">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-primary/20 pb-5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xl font-bold text-primary tracking-widest uppercase text-glow">
            Command Centre
          </motion.h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">J.A.R.V.I.S. — Built by SAKNS</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className={`flex items-center gap-1.5 px-2 py-1 border ${health?.status === "ok" ? "text-green-400 border-green-400/30 bg-green-400/5" : "text-red-400 border-red-400/30"}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${health?.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
            </span>
            {health?.status === "ok" ? "SYSTEMS ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* IST Clock */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 border border-primary/20 p-4 relative overflow-hidden group hover:border-primary/40 transition-colors"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <div>
            <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-1 font-mono">India Standard Time (IST · UTC+5:30)</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-primary text-glow tabular-nums">{time}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{date}</div>
          </div>
          <div className="text-[10px] font-mono text-primary/30 uppercase tracking-widest text-right">
            <div>Grok AI · Online</div>
            <div className="mt-1">All Systems Nominal</div>
          </div>
        </div>
      </motion.div>

      {/* Quick Launch */}
      <div>
        <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-3 font-mono flex items-center gap-2">
          <Globe className="w-3 h-3" /> Quick Launch
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {QUICK_LINKS.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`flex flex-col items-center gap-1.5 py-3 px-1 border font-mono text-center cursor-pointer transition-all duration-200 group ${link.color}`}
            >
              <div className="text-lg leading-none">{link.icon}</div>
              <div className="text-[9px] uppercase tracking-wider">{link.name}</div>
              <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-primary/5 border border-primary/10 animate-pulse" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Commands", value: stats.totalCommands, icon: Command, color: "text-primary" },
            { label: "AI Chats", value: stats.totalChats, icon: MessageSquare, color: "text-cyan-400" },
            { label: "Voice Ops", value: stats.totalVoiceCommands, icon: Mic, color: "text-purple-400" },
            { label: "Music / News", value: stats.totalMusicPlayed + stats.totalNewsRequests, icon: Music, color: "text-yellow-400" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-black/60 border border-primary/20 p-4 relative overflow-hidden group hover:border-primary/40 transition-colors cursor-default"
            >
              <div className="absolute inset-0 bg-primary/3 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${s.color}`}>{String(s.value).padStart(4, "0")}</div>
                </div>
                <s.icon className={`w-4 h-4 ${s.color} opacity-40 mt-0.5`} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart + Actions */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-black/60 border border-primary/20 p-4 hover:border-primary/40 transition-colors">
            <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
              <Zap className="w-3 h-3" /> Activity Distribution
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", border: "1px solid hsl(var(--primary))", borderRadius: 0, fontFamily: "monospace", fontSize: 11 }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                  cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/60 border border-primary/20 p-4 hover:border-primary/40 transition-colors">
            <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
              <Activity className="w-3 h-3" /> Quick Actions
            </div>
            <div className="space-y-2">
              {[
                { label: "Open AI Chat", icon: MessageSquare, action: () => navigate("/chat") },
                { label: "Browse Music", icon: Music, action: () => navigate("/music") },
                { label: "Latest News", icon: Newspaper, action: () => navigate("/news") },
                { label: "Command History", icon: BookOpen, action: () => navigate("/history") },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2 border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-mono text-xs uppercase tracking-wider text-left"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-primary/10 text-[9px] text-primary/30 font-mono uppercase tracking-widest text-center">
              Powered by Grok · Built by SAKNS
            </div>
          </div>
        </div>
      )}

      {/* Top commands */}
      {stats && stats.mostUsedCommands.length > 0 && (
        <div className="bg-black/60 border border-primary/20 p-4 hover:border-primary/40 transition-colors">
          <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
            <Search className="w-3 h-3" /> Top Command Vectors
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.mostUsedCommands.slice(0, 5).map((cmd, i) => (
              <motion.div
                key={cmd.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="border border-primary/10 p-3 text-center hover:border-primary/30 transition-colors"
              >
                <div className="text-xl font-bold font-mono text-primary text-glow">{String(cmd.count).padStart(3, "0")}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">{cmd.action || "unknown"}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
