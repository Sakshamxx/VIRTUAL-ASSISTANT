import { useGetHistory } from "@workspace/api-client-react";
import { History, MessageSquare, Mic, Music, Newspaper, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const iconMap = {
  chat: MessageSquare,
  voice: Mic,
  music: Music,
  news: Newspaper
};

export default function HistoryPage() {
  const { data: history, isLoading } = useGetHistory({ limit: 50 });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-widest uppercase text-glow">Command Logs</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">System activity archive</p>
        </div>
        <div className="text-xs font-mono text-primary/50 bg-primary/10 px-3 py-1 border border-primary/20">
          RECORDS: {history?.total || 0}
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-4 font-mono">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/20 before:to-transparent">
            {history?.entries.map((entry, i) => {
              const Icon = iconMap[entry.type as keyof typeof iconMap] || History;
              
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={entry.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  {/* Icon Node */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary/50 bg-black text-primary/80 group-hover:border-primary group-hover:text-primary transition-colors shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <Icon className="w-3 h-3" />
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-4 bg-black/60 border border-primary/20 hud-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-primary/50 px-2 py-0.5 bg-primary/10 border border-primary/20">
                        {entry.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(entry.createdAt), 'MMM dd - HH:mm:ss')}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground block mb-1">INPUT:</span>
                      <p className="text-sm text-foreground truncate">{entry.input}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-primary/50 block mb-1">OUTPUT:</span>
                      <p className="text-sm text-primary/90 line-clamp-2">{entry.response}</p>
                    </div>

                    {entry.action && entry.action !== 'none' && (
                      <div className="mt-3 pt-2 border-t border-primary/10 text-[10px] uppercase tracking-widest text-primary">
                        ACTION EXECUTED: {entry.action}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
            {(!history?.entries || history.entries.length === 0) && (
              <div className="text-center text-muted-foreground uppercase tracking-widest py-12 relative z-10 bg-background/80 backdrop-blur-sm border border-dashed border-primary/20 w-fit mx-auto px-8">
                No logs recorded
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
