import { Link, useLocation } from "wouter";
import { Cpu, MessageSquare, Music, Newspaper, History, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", label: "SYSTEM", icon: Cpu },
    { href: "/chat", label: "COMMS", icon: MessageSquare },
    { href: "/music", label: "AUDIO", icon: Music },
    { href: "/news", label: "INTEL", icon: Newspaper },
    { href: "/history", label: "LOGS", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-mono text-sm tracking-tight bg-noise overflow-hidden">
      
      {/* Sidebar / Topbar */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 bg-background/80 backdrop-blur-md flex flex-col justify-between z-10 p-4 md:p-6 shrink-0 hud-border-active md:h-screen md:sticky top-0">
        
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-none bg-primary/20 border border-primary flex items-center justify-center animate-pulse">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-primary font-bold text-lg leading-none tracking-widest text-glow">J.A.R.V.I.S.</div>
              <div className="text-xs text-muted-foreground uppercase opacity-70">ONLINE // OS v4.2.1</div>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 ${active ? 'border-primary bg-primary/10 text-primary text-glow' : 'border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="font-semibold tracking-wider uppercase">{item.label}</span>
                    {active && (
                      <motion.div layoutId="navIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:block">
          <div className="text-xs text-muted-foreground mb-4 uppercase tracking-widest opacity-50 flex items-center gap-2">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            Auth: {user?.username}
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 w-full text-left text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-wider">
            <LogOut className="w-4 h-4" />
            Terminate
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-0 flex flex-col min-h-0 h-[calc(100vh-80px)] md:h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-primary/20 opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-primary/20 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-primary/20 opacity-50" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-primary/20 opacity-50" />
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

    </div>
  );
}
