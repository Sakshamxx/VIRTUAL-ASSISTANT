import { useState } from "react";
import { useRegister, useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, TerminalSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMut = useLogin();
  const registerMut = useRegister();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (isLogin) {
      loginMut.mutate({ data: { username, password } }, {
        onSuccess: (data) => {
          login(data.token, data.user);
        },
        onError: (err) => {
          toast({
            title: "Access Denied",
            description: err.message || "Invalid credentials",
            variant: "destructive"
          });
        }
      });
    } else {
      registerMut.mutate({ data: { username, password } }, {
        onSuccess: (data) => {
          login(data.token, data.user);
          toast({ title: "Registration Successful", description: "Welcome to the system." });
        },
        onError: (err) => {
          toast({
            title: "Registration Failed",
            description: err.message || "An error occurred",
            variant: "destructive"
          });
        }
      });
    }
  };

  const isPending = loginMut.isPending || registerMut.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 bg-noise font-mono relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <Cpu className="w-[80vw] h-[80vw]" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="hud-border bg-background/50 backdrop-blur-xl p-8 relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary mb-4 animate-pulse">
              <TerminalSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest text-primary text-glow uppercase">
              J.A.R.V.I.S.
            </h1>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
              Identity Verification Required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-primary/80 uppercase tracking-wider">Operator ID</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-black/50 border-primary/30 focus-visible:ring-primary focus-visible:border-primary rounded-none h-12 font-mono text-lg"
                  placeholder="Enter ID..."
                  disabled={isPending}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-primary/80 uppercase tracking-wider">Passcode</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-primary/30 focus-visible:ring-primary focus-visible:border-primary rounded-none h-12 font-mono text-lg"
                  placeholder="••••••••"
                  disabled={isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-primary/20 hover:bg-primary/40 border border-primary text-primary font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:text-glow group relative overflow-hidden"
            >
              <div className="absolute inset-0 w-0 bg-primary/10 transition-all duration-300 ease-out group-hover:w-full" />
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="relative z-10">{isLogin ? "Initialize Session" : "Register Identity"}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-widest uppercase"
            >
              {isLogin ? "[ Request New Access ]" : "[ Authenticate Existing ]"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
