// In-memory database for local development (no PostgreSQL required)
import * as schema from "./schema";

export * from "./schema";
export { schema };

// Types
export type User = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

export type CommandHistory = {
  id: number;
  type: string;
  input: string;
  response: string;
  action: string | null;
  userId: number | null;
  createdAt: Date;
};

// ─── In-memory stores ───────────────────────────────────────────────────────
let _userIdSeq = 1;
let _historyIdSeq = 1;
export const _users: User[] = [];
export const _history: CommandHistory[] = [];

// ─── Simple CRUD helpers (used by route files directly) ─────────────────────
export const userStore = {
  findByUsername(username: string): User | undefined {
    return _users.find((u) => u.username === username);
  },
  findById(id: number): User | undefined {
    return _users.find((u) => u.id === id);
  },
  create(data: { username: string; passwordHash: string }): User {
    const user: User = {
      id: _userIdSeq++,
      username: data.username,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    };
    _users.push(user);
    return user;
  },
};

export const historyStore = {
  insert(data: { type: string; input: string; response: string; action?: string | null; userId?: number | null }): CommandHistory {
    const entry: CommandHistory = {
      id: _historyIdSeq++,
      type: data.type,
      input: data.input,
      response: data.response,
      action: data.action ?? null,
      userId: data.userId ?? null,
      createdAt: new Date(),
    };
    _history.push(entry);
    return entry;
  },
  getRecent(limit = 50): CommandHistory[] {
    return [..._history].reverse().slice(0, limit);
  },
  count(): number {
    return _history.length;
  },
  countByType(type: string): number {
    return _history.filter((h) => h.type === type).length;
  },
  topActions(limit = 5): { action: string; count: number }[] {
    const groups: Record<string, number> = {};
    _history.forEach((h) => {
      if (h.action) groups[h.action] = (groups[h.action] ?? 0) + 1;
    });
    return Object.entries(groups)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },
};

// ─── Stub `db` and `pool` so existing imports don't crash ───────────────────
export const pool = { end: () => Promise.resolve() };
export const db = {} as any;
export const usersTable = schema.usersTable;
export const commandHistoryTable = schema.commandHistoryTable;
