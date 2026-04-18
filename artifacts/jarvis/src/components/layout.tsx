import { Link, useLocation } from "wouter";
import { MessageSquare, Music, Newspaper, History, LogOut, LayoutDashboard, Mic, ListTodo } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { href: "/", label: "SYSTEM", icon: LayoutDashboard },
    { href: "/chat", label: "COMMS", icon: MessageSquare },
    { href: "/music", label: "AUDIO", icon: Music },
    { href: "/news", label: "INTEL", icon: Newspaper },
    { href: "/tasks", label: "TASKS", icon: ListTodo },
    { href: "/history", label: "LOGS", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-mono text-sm overflow-hidden">

      {/* Sidebar */}
      <div className={`shrink-0 border-b md:border-b-0 md:border-r border-border/30 bg-black/80 backdrop-blur-xl flex flex-col z-20 transition-all duration-300 md:h-screen md:sticky top-0 ${collapsed ? "md:w-[60px]" : "md:w-56"}`}>

        {/* Logo */}
        <div className={`p-3 border-b border-primary/10 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden shadow-[0_0_14px_rgba(0,200,220,0.4)] shrink-0 hover:shadow-[0_0_24px_rgba(0,200,220,0.7)] transition-shadow"
            title="Toggle sidebar"
          >
            <img src="/avatar.jpeg" alt="JARVIS" className="w-full h-full object-cover" />
          </button>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                <div className="text-primary font-bold text-sm leading-none tracking-widest text-glow whitespace-nowrap">J.A.R.V.I.S.</div>
                <div className="text-[9px] text-muted-foreground uppercase opacity-60 mt-0.5 whitespace-nowrap">ONLINE // OS v4.2.1</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex flex-row md:flex-col gap-1 p-2 overflow-x-auto md:overflow-visible flex-1">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 relative group ${
                  active ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                } ${collapsed ? "justify-center" : ""}`}>
                  {active && <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_6px_hsl(var(--primary))]" />}
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="font-semibold tracking-wider uppercase text-xs whitespace-nowrap">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-black border border-primary/30 text-primary text-xs uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Operator Identity */}
        <div className={`hidden md:block p-3 border-t border-primary/10 space-y-2`}>
          {/* Saksham Chauhan */}
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/30 shrink-0">
              <img src="/saksham-avatar.jpeg" alt="Saksham" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-[10px] text-foreground/80 font-medium leading-tight whitespace-nowrap">Saksham Chauhan</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{user?.username} · Online</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={logout} className={`flex items-center gap-2 px-3 py-1.5 w-full text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-colors uppercase tracking-wider text-[10px] border border-transparent hover:border-red-400/20 ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Terminate Session</span>}
          </button>

          {!collapsed && (
            <div className="text-[9px] text-primary/20 uppercase tracking-widest text-center pt-1 border-t border-primary/5">
              Built by Saksham Chauhan · Powered by Tech-Verse
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 relative z-0 flex flex-col min-h-0 h-[calc(100vh-60px)] md:h-screen overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l border-t border-primary/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-primary/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-primary/20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r border-b border-primary/20 pointer-events-none" />

        {/* Hint bar */}
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-primary/10 bg-black/40 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest shrink-0">
          <Mic className="w-3 h-3" />
          <span>Say "open LinkedIn", "what time is it IST", or ask JARVIS anything</span>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 relative z-10">
          <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full max-w-6xl mx-auto">
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
