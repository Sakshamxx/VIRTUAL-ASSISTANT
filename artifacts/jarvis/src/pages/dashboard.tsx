import { useGetActivityStats, useHealthCheck, getGetActivityStatsQueryKey } from "@workspace/api-client-react";
import { Activity, Server, Zap, Cpu, Database, Command, MessageSquare, Mic, Music, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetActivityStats();
  const { data: health } = useHealthCheck({ query: { refetchInterval: 30000 } });

  const chartData = stats ? [
    { name: "Chat", value: stats.totalChats, icon: MessageSquare },
    { name: "Voice", value: stats.totalVoiceCommands, icon: Mic },
    { name: "Audio", value: stats.totalMusicPlayed, icon: Music },
    { name: "Intel", value: stats.totalNewsRequests, icon: Newspaper },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-widest uppercase text-glow">System Overview</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">Main Command Center Interface</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="uppercase tracking-widest text-muted-foreground">Status:</span>
          <span className={`flex items-center gap-1 font-bold ${health?.status === "ok" ? "text-green-400" : "text-destructive"}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === "ok" ? "bg-green-400" : "bg-destructive"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === "ok" ? "bg-green-400" : "bg-destructive"}`}></span>
            </span>
            {health?.status === "ok" ? "OPTIMAL" : "CRITICAL"}
          </span>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-primary/5 border border-primary/10 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Inputs" value={stats.totalCommands} icon={Command} delay={0.1} />
            <StatCard title="Comms" value={stats.totalChats} icon={MessageSquare} delay={0.2} />
            <StatCard title="Voice Ops" value={stats.totalVoiceCommands} icon={Mic} delay={0.3} />
            <StatCard title="Audio / Intel" value={stats.totalMusicPlayed + stats.totalNewsRequests} icon={Activity} delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="col-span-1 lg:col-span-2 bg-black/40 border-primary/20 rounded-none hud-border">
              <CardHeader className="border-b border-primary/10 pb-4">
                <CardTitle className="text-sm font-normal text-primary/80 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Activity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="var(--font-mono)"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      fontFamily="var(--font-mono)"
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid var(--primary)', borderRadius: 0, fontFamily: 'var(--font-mono)' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--primary)" fillOpacity={0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-primary/20 rounded-none hud-border">
              <CardHeader className="border-b border-primary/10 pb-4">
                <CardTitle className="text-sm font-normal text-primary/80 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Top Action Vectors
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {stats.mostUsedCommands.map((cmd, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      key={cmd.action} 
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-primary/50 font-mono text-xs">0{i+1}</span>
                        <span className="uppercase tracking-wider group-hover:text-primary transition-colors">{cmd.action || "UNKNOWN"}</span>
                      </div>
                      <div className="text-primary font-bold font-mono">
                        {cmd.count.toString().padStart(3, '0')}
                      </div>
                    </motion.div>
                  ))}
                  {stats.mostUsedCommands.length === 0 && (
                    <div className="text-sm text-muted-foreground uppercase text-center py-8">No data gathered</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, delay }: { title: string, value: number, icon: any, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-black/40 border-primary/20 rounded-none hud-border relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-xs font-normal text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
          <Icon className="w-4 h-4 text-primary/50" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-primary font-mono text-glow">
            {value.toString().padStart(4, '0')}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
