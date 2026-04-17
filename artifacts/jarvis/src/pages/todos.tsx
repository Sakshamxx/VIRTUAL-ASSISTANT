import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Circle, Flag, Tag, Sparkles, ListTodo } from "lucide-react";

type Priority = "high" | "medium" | "low";
type Category = "work" | "personal" | "study" | "ideas" | "other";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  category: Category;
  createdAt: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  high:   { label: "Critical",  color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30",    dot: "bg-red-400" },
  medium: { label: "Standard",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", dot: "bg-yellow-400" },
  low:    { label: "Low",       color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30",  dot: "bg-green-400" },
};

const CATEGORY_CONFIG: Record<Category, { label: string; icon: string }> = {
  work:     { label: "Work",     icon: "💼" },
  personal: { label: "Personal", icon: "👤" },
  study:    { label: "Study",    icon: "📚" },
  ideas:    { label: "Ideas",    icon: "💡" },
  other:    { label: "Other",    icon: "📌" },
};

function loadTodos(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem("jarvis_todos") || "[]");
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem("jarvis_todos", JSON.stringify(todos));
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("work");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [catFilter, setCatFilter] = useState<Category | "all">("all");

  useEffect(() => { saveTodos(todos); }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input.trim(),
      done: false,
      priority,
      category,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setInput("");
  };

  const toggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

  const filtered = todos.filter(t => {
    if (filter === "active" && t.done) return false;
    if (filter === "done" && !t.done) return false;
    if (catFilter !== "all" && t.category !== catFilter) return false;
    return true;
  });

  const stats = {
    total: todos.length,
    done: todos.filter(t => t.done).length,
    high: todos.filter(t => t.priority === "high" && !t.done).length,
  };

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-5 pb-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between border-b border-primary/20 pb-5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-primary tracking-widest uppercase text-glow flex items-center gap-2">
            <ListTodo className="w-5 h-5" /> Task Matrix
          </motion.h1>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">Operator directive queue — Built by SAKNS</p>
        </div>
        <div className="text-right font-mono text-[10px] text-primary/40 uppercase tracking-widest">
          <div>{stats.done}/{stats.total} complete</div>
          {stats.high > 0 && <div className="text-red-400 mt-0.5">⚠ {stats.high} critical</div>}
        </div>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-primary/50 uppercase tracking-widest">
            <span>Mission Progress</span><span>{progress}%</span>
          </div>
          <div className="h-1 bg-primary/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
            />
          </div>
        </div>
      )}

      {/* Add task */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 border border-primary/20 p-4 hover:border-primary/40 transition-colors">
        <form onSubmit={addTodo} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter new directive..."
              className="flex-1 bg-transparent border-b border-primary/30 text-sm font-mono text-white placeholder:text-muted-foreground/50 pb-1 focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" disabled={!input.trim()}
              className="px-4 py-1 border border-primary text-primary text-xs font-mono uppercase tracking-widest hover:bg-primary/10 disabled:opacity-30 transition-all flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <Flag className="w-3 h-3 text-primary/40" />
              {(["high","medium","low"] as Priority[]).map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border transition-all ${priority === p ? PRIORITY_CONFIG[p].bg + " " + PRIORITY_CONFIG[p].color + " border-opacity-60" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
            {/* Category */}
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-primary/40" />
              {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setCategory(k)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border transition-all ${category === k ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </motion.div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["all","active","done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border transition-all ${filter === f ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
              {f === "all" ? `All (${todos.length})` : f === "active" ? `Active (${todos.filter(t => !t.done).length})` : `Done (${stats.done})`}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setCatFilter("all")}
            className={`px-2 py-1 text-[10px] font-mono border transition-all ${catFilter === "all" ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
            All
          </button>
          {(Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]).map(([k, v]) => (
            <button key={k} onClick={() => setCatFilter(k)}
              className={`px-2 py-1 text-[10px] font-mono border transition-all ${catFilter === k ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-muted-foreground hover:border-primary/30"}`}>
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Todo list */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="border border-dashed border-primary/20 py-16 text-center">
          <Sparkles className="w-8 h-8 text-primary/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
            {todos.length === 0 ? "No directives logged. Add your first task." : "No tasks match current filter."}
          </p>
        </motion.div>
      ) : (
        <Reorder.Group axis="y" values={filtered} onReorder={(reordered) => {
          setTodos(prev => {
            const otherIds = new Set(filtered.map(t => t.id));
            const others = prev.filter(t => !otherIds.has(t.id));
            return [...reordered, ...others];
          });
        }} className="space-y-2">
          <AnimatePresence>
            {filtered.map((todo) => (
              <Reorder.Item key={todo.id} value={todo} as="div">
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className={`group flex items-center gap-3 p-3 border transition-all cursor-grab active:cursor-grabbing ${
                    todo.done
                      ? "border-primary/10 bg-black/20 opacity-50"
                      : `border-primary/15 bg-black/50 hover:border-primary/40 ${PRIORITY_CONFIG[todo.priority].bg}`
                  }`}
                >
                  {/* Priority dot */}
                  <div className={`w-1 h-8 rounded-full shrink-0 ${todo.done ? "bg-muted-foreground/30" : PRIORITY_CONFIG[todo.priority].dot}`}
                    style={{ boxShadow: todo.done ? "none" : `0 0 6px currentColor` }} />

                  {/* Checkbox */}
                  <button onClick={() => toggle(todo.id)} className="shrink-0">
                    {todo.done
                      ? <CheckCircle2 className="w-4 h-4 text-primary" />
                      : <Circle className="w-4 h-4 text-primary/30 group-hover:text-primary/60 transition-colors" />
                    }
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-mono transition-all ${todo.done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider">
                        {CATEGORY_CONFIG[todo.category].icon} {CATEGORY_CONFIG[todo.category].label}
                      </span>
                      <span className={`text-[9px] font-mono uppercase tracking-wider ${PRIORITY_CONFIG[todo.priority].color}`}>
                        · {PRIORITY_CONFIG[todo.priority].label}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/30">
                        · {new Date(todo.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => remove(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {todos.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => setTodos(prev => prev.filter(t => !t.done))}
            className="text-[10px] font-mono text-muted-foreground/40 hover:text-red-400 transition-colors uppercase tracking-widest">
            Clear completed ({stats.done})
          </button>
        </div>
      )}
    </div>
  );
}
