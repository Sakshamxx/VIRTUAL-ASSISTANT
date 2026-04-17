import { useGetMusicLibrary, usePlayMusic } from "@workspace/api-client-react";
import { Music, Play, Loader2, Volume2, Search, Disc3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function MusicPage() {
  const { data: library, isLoading } = useGetMusicLibrary();
  const playMusicMut = usePlayMusic();
  const [activeSong, setActiveSong] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePlay = (songName: string, url: string) => {
    setActiveSong(songName);
    window.open(url, "_blank");
    playMusicMut.mutate({ data: { songName } });
  };

  const filtered = library?.songs.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/20 pb-5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-primary tracking-widest uppercase text-glow flex items-center gap-2">
            <Disc3 className="w-5 h-5" /> Audio Database
          </motion.h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
            {library?.songs.length || 0} tracks indexed
            {activeSong && <span className="text-primary/70"> · Playing: {activeSong}</span>}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/30" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-black/50 border border-primary/20 text-xs font-mono pl-9 pr-4 py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40 w-52"
          />
        </div>
      </div>

      {/* Now playing banner */}
      <AnimatePresence>
        {activeSong && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/10 border border-primary/40 p-3 flex items-center gap-3 overflow-hidden"
          >
            <div className="flex gap-0.5 items-end h-5">
              {[1,2,3,4].map(i => (
                <motion.div key={i} className="w-1 bg-primary rounded-full"
                  animate={{ height: ["40%","100%","60%","80%","40%"] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
            <div className="font-mono text-xs text-primary uppercase tracking-widest">
              Now playing: <span className="font-bold">{activeSong}</span>
            </div>
            <button onClick={() => setActiveSong(null)} className="ml-auto text-primary/50 hover:text-primary text-[10px] font-mono uppercase tracking-widest">Stop</button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          </div>
          <p className="text-xs font-mono text-primary/50 uppercase tracking-widest animate-pulse">Loading audio library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {filtered.map((song, i) => {
              const isActive = activeSong === song.name;
              return (
                <motion.div
                  key={song.url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlay(song.name, song.url)}
                  className={`p-4 border font-mono cursor-pointer transition-all group relative overflow-hidden ${
                    isActive
                      ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(0,200,220,0.15)]"
                      : "bg-black/40 border-primary/15 hover:border-primary/50 hover:bg-black/60"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
                  )}

                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-9 h-9 flex items-center justify-center border shrink-0 transition-all ${
                      isActive ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-primary/30 group-hover:border-primary/50 group-hover:text-primary/60"
                    }`}>
                      {isActive
                        ? <Volume2 className="w-4 h-4 animate-pulse" />
                        : <Music className="w-4 h-4" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold uppercase truncate transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`}>
                        {song.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider">
                        {isActive ? "▶ Playing on YouTube" : "Click to play"}
                      </div>
                    </div>

                    <motion.div
                      className="text-primary/30 group-hover:text-primary/70 transition-colors"
                      whileHover={{ scale: 1.2 }}
                    >
                      <Play className="w-4 h-4" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full border border-dashed border-primary/20 py-16 text-center">
              <Music className="w-8 h-8 text-primary/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">No tracks match "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
