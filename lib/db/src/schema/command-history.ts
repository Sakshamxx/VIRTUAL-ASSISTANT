import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commandHistoryTable = pgTable("command_history", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  input: text("input").notNull(),
  response: text("response").notNull(),
  action: text("action"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommandHistorySchema = createInsertSchema(commandHistoryTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCommandHistory = z.infer<typeof insertCommandHistorySchema>;
export type CommandHistory = typeof commandHistoryTable.$inferSelect;
