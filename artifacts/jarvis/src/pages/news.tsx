import { useGetNews } from "@workspace/api-client-react";
import { Newspaper, ExternalLink, Loader2, RefreshCw, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

function safeRelative(str: string): string {
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return "Just now";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return "Recently"; }
}

const ACCENT_COLORS = [
  "border-l-cyan-400", "border-l-purple-400", "border-l-blue-400",
  "border-l-green-400", "border-l-yellow-400", "border-l-pink-400",
];

export default function NewsPage() {
  const qc = useQueryClient();
  const { data: news, isLoading, error } = useGetNews({ limit: 12 });

  const refresh = () => qc.invalidateQueries({ queryKey: ["/api/news"] });

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-primary/20 pb-5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-primary tracking-widest uppercase text-glow flex items-center gap-2">
            <Radio className="w-5 h-5" /> Global Intel
          </motion.h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
            Live data stream · NewsData.io · India &amp; World
          </p>
        </div>
        <div className="flex items-center gap-3">
          {news && (
            <span className="text-[10px] font-mono text-primary/40 uppercase tracking-widest border border-primary/15 px-2 py-1">
              {news.articles.length} signals
            </span>
          )}
          <button onClick={refresh}
            className="p-2 border border-primary/20 text-primary/50 hover:text-primary hover:border-primary/50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          </div>
          <p className="text-xs font-mono text-primary/50 uppercase tracking-widest animate-pulse">Acquiring intel signal...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="border border-red-400/20 bg-red-400/5 p-8 text-center space-y-2">
          <p className="text-red-400 text-sm font-mono uppercase tracking-widest">Intel feed disrupted</p>
          <p className="text-muted-foreground text-xs">Check your NEWS_API_KEY or try refreshing</p>
          <button onClick={refresh} className="mt-2 px-4 py-1.5 border border-red-400/30 text-red-400 text-xs font-mono uppercase tracking-widest hover:bg-red-400/10 transition-all">Retry</button>
        </div>
      )}

      {!isLoading && news && (
        <>
          {/* Featured article */}
          {news.articles[0] && (
            <motion.a
              href={news.articles[0].url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.005 }}
              className="block bg-black/70 border border-primary/30 p-5 group hover:border-primary/60 transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 animate-pulse">● LIVE</span>
                <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">{news.articles[0].source} · {safeRelative(news.articles[0].publishedAt)}</span>
              </div>
              <h2 className="text-base font-bold uppercase leading-snug text-foreground group-hover:text-primary transition-colors mb-2 relative z-10">
                {news.articles[0].title}
              </h2>
              {news.articles[0].description && (
                <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2 relative z-10">
                  {news.articles[0].description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-1 text-primary/50 text-[10px] font-mono group-hover:text-primary transition-colors relative z-10">
                Access Full Intel <ExternalLink className="w-3 h-3" />
              </div>
            </motion.a>
          )}

          {/* Articles grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.articles.slice(1).map((article, i) => (
              <motion.a
                key={i}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.015 }}
                className={`bg-black/50 border border-primary/10 border-l-2 ${ACCENT_COLORS[i % ACCENT_COLORS.length]} p-4 flex flex-col group hover:border-primary/30 transition-all cursor-pointer`}
              >
                <div className="text-[9px] text-primary/40 font-mono uppercase tracking-widest mb-2 flex justify-between">
                  <span className="truncate max-w-[120px]">{article.source}</span>
                  <span>{safeRelative(article.publishedAt)}</span>
                </div>
                <h3 className="font-bold text-xs uppercase leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3 flex-1">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-[11px] text-muted-foreground font-mono leading-relaxed line-clamp-2 mb-3">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-primary/30 text-[10px] font-mono group-hover:text-primary/70 transition-colors mt-auto">
                  Read more <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </motion.a>
            ))}
          </div>

          {news.articles.length === 0 && (
            <div className="border border-dashed border-primary/20 py-16 text-center">
              <Newspaper className="w-8 h-8 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">No intel signals received. Try refreshing.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
