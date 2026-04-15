import { useGetMusicLibrary, usePlayMusic } from "@workspace/api-client-react";
import { Music, Play, Loader2, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MusicPage() {
  const { data: library, isLoading } = useGetMusicLibrary();
  const playMusicMut = usePlayMusic();
  const [activeSong, setActiveSong] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handlePlay = (songName: string, url: string) => {
    setActiveSong(songName);
    window.open(url, '_blank');
    playMusicMut.mutate({ data: { songName } }, {
      onError: () => {
        toast({ title: "Log Failed", description: "Could not log playback to history.", variant: "destructive" });
      }
    });
  };

  const filteredSongs = library?.songs.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-widest uppercase text-glow">Audio Database</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Synchronizing media tracks</p>
        </div>
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="FILTER DATABASE..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-primary/30 text-xs font-mono px-3 py-2 uppercase placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={song.url}
              className={`p-4 border font-mono transition-all group cursor-pointer ${
                activeSong === song.name 
                  ? 'bg-primary/20 border-primary hud-border-active' 
                  : 'bg-black/40 border-primary/20 hover:border-primary/50 hud-border'
              }`}
              onClick={() => handlePlay(song.name, song.url)}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center border ${
                    activeSong === song.name ? 'border-primary bg-primary/20 text-primary' : 'border-primary/30 text-primary/50 bg-black'
                  }`}>
                    {activeSong === song.name ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Music className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase truncate max-w-[180px] group-hover:text-primary transition-colors">
                      {song.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase mt-1">Ready for playback</div>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredSongs.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground uppercase tracking-widest font-mono text-sm border border-dashed border-primary/20">
              No matching records found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
