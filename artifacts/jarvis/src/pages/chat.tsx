import { useState, useRef, useEffect } from "react";
import { useSendChat, useVoiceCommand, ChatMessage } from "@workspace/api-client-react";
import { useSpeech } from "@/hooks/use-speech";
import { Mic, Send, TerminalSquare, MicOff, SquareSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LocalMessage = {
  id: string;
  role: 'user' | 'jarvis';
  content: string;
  timestamp: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendChatMut = useSendChat();
  const voiceCommandMut = useVoiceCommand();

  const handleResponse = (reply: string, newSessionId?: string, action?: string, data?: any) => {
    if (newSessionId) setSessionId(newSessionId);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString() + "_j",
      role: 'jarvis',
      content: reply,
      timestamp: new Date().toISOString()
    }]);

    if (action === 'play_music' || action === 'open_url') {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    setMessages(prev => [...prev, {
      id: Date.now().toString() + "_u",
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString()
    }]);

    sendChatMut.mutate({ data: { message: userMsg, sessionId } }, {
      onSuccess: (data) => {
        handleResponse(data.reply, data.sessionId);
      }
    });
  };

  const { isListening, toggleListening, hasSupport } = useSpeech((transcript) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + "_vu",
      role: 'user',
      content: `[VOICE] ${transcript}`,
      timestamp: new Date().toISOString()
    }]);

    voiceCommandMut.mutate({ data: { command: transcript } }, {
      onSuccess: (data) => {
        handleResponse(data.reply, undefined, data.action, data.data);
      }
    });
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendChatMut.isPending, voiceCommandMut.isPending]);

  const isPending = sendChatMut.isPending || voiceCommandMut.isPending;

  return (
    <div className="h-full flex flex-col relative">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <SquareSquare className="w-64 h-64" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <TerminalSquare className="w-12 h-12 text-primary mb-4" />
            <p className="uppercase tracking-widest font-bold">Comms Channel Open</p>
            <p className="text-sm font-mono mt-2">Awaiting operator input...</p>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-primary/50 font-mono mb-1 tracking-widest uppercase">
                  {msg.role === 'user' ? 'Operator' : 'J.A.R.V.I.S.'} // {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <div 
                  className={`px-4 py-3 text-sm font-mono leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary/20 border border-primary/50 text-white rounded-tl-lg rounded-bl-lg rounded-br-lg' 
                      : 'bg-black/60 border border-border text-primary rounded-tr-lg rounded-br-lg rounded-bl-lg hud-border'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="max-w-[80%] flex flex-col items-start">
                <span className="text-[10px] text-primary/50 font-mono mb-1 tracking-widest uppercase">J.A.R.V.I.S. // processing</span>
                <div className="px-4 py-3 bg-black/60 border border-border text-primary rounded-tr-lg rounded-br-lg rounded-bl-lg hud-border flex gap-1">
                  <div className="w-1.5 h-3 bg-primary animate-pulse" />
                  <div className="w-1.5 h-3 bg-primary animate-pulse delay-75" />
                  <div className="w-1.5 h-3 bg-primary animate-pulse delay-150" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 z-10 border-t border-primary/20 bg-black/50 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full bg-black/80 border border-primary/30 text-white placeholder:text-muted-foreground px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter command directive..."
              disabled={isPending || isListening}
            />
            {hasSupport && (
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-colors ${
                  isListening ? 'text-destructive animate-pulse' : 'text-primary/50 hover:text-primary'
                }`}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            className="bg-primary/20 hover:bg-primary/40 border border-primary text-primary px-6 py-3 font-bold tracking-widest uppercase disabled:opacity-50 transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
