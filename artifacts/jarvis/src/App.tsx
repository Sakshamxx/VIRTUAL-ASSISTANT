import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import MusicPage from "@/pages/music";
import NewsPage from "@/pages/news";
import HistoryPage from "@/pages/history";
import TodosPage from "@/pages/todos";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-primary text-sm uppercase tracking-widest gap-4">
        <div className="flex gap-1.5 items-end h-8">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-1 bg-primary animate-pulse rounded-full"
              style={{ height: `${20 + i * 8}px`, animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        <span className="animate-pulse">Initializing JARVIS Protocol...</span>
      </div>
    );
  }

  if (!token) return <Redirect to="/auth" />;

  return <Layout><Component /></Layout>;
}

function Router() {
  const { token } = useAuth();

  return (
    <Switch>
      <Route path="/auth">{token ? <Redirect to="/" /> : <AuthPage />}</Route>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/music" component={() => <ProtectedRoute component={MusicPage} />} />
      <Route path="/news" component={() => <ProtectedRoute component={NewsPage} />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={TodosPage} />} />
      <Route path="/history" component={() => <ProtectedRoute component={HistoryPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
