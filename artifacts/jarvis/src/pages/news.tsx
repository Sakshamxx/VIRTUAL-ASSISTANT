import { useGetNews } from "@workspace/api-client-react";
import { Newspaper, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function NewsPage() {
  const { data: news, isLoading } = useGetNews({ limit: 12 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-widest uppercase text-glow">Global Intel</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Live data stream processing</p>
        </div>
        <Newspaper className="w-6 h-6 text-primary/50" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.articles.map((article, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-black/60 border border-primary/20 hud-border p-5 flex flex-col group hover:border-primary/50 transition-colors"
            >
              <div className="text-[10px] text-primary/60 font-mono uppercase tracking-widest mb-3 flex justify-between items-center border-b border-primary/10 pb-2">
                <span>SRC: {article.source}</span>
                <span>{format(new Date(article.publishedAt), 'HH:mm:ss')}</span>
              </div>
              
              <h3 className="font-bold text-sm uppercase leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-3">
                {article.title}
              </h3>
              
              {article.description && (
                <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3 mb-4 flex-1">
                  {article.description}
                </p>
              )}
              
              <div className="mt-auto pt-4 flex justify-end">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                >
                  Access Full Intel <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
          {(!news?.articles || news.articles.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground uppercase tracking-widest font-mono text-sm border border-dashed border-primary/20">
              Intel feed currently unavailable
            </div>
          )}
        </div>
      )}
    </div>
  );
}
