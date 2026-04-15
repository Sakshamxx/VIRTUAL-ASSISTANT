import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";

// Pages
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import MusicPage from "@/pages/music";
import NewsPage from "@/pages/news";
import HistoryPage from "@/pages/history";

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-mono text-primary text-sm uppercase tracking-widest animate-pulse">
        Initializing JARVIS Protocol...
      </div>
    );
  }

  if (!token) {
    return <Redirect to="/auth" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const { token } = useAuth();

  return (
    <Switch>
      <Route path="/auth">
        {token ? <Redirect to="/" /> : <AuthPage />}
      </Route>
      
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/chat" component={() => <ProtectedRoute component={Chat} />} />
      <Route path="/music" component={() => <ProtectedRoute component={MusicPage} />} />
      <Route path="/news" component={() => <ProtectedRoute component={NewsPage} />} />
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
