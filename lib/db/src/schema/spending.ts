import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const spendingRecordsTable = pgTable("spending_records", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  category: text("category").notNull(),
  emotion: text("emotion").notNull(),
  reason: text("reason").notNull(),
  note: text("note"),
  analysisSpendingPattern: text("analysis_spending_pattern"),
  analysisEmotionalTrigger: text("analysis_emotional_trigger"),
  analysisPersonalizedAdvice: text("analysis_personalized_advice"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSpendingRecordSchema = createInsertSchema(spendingRecordsTable).omit({
  id: true,
  createdAt: true,
  analysisSpendingPattern: true,
  analysisEmotionalTrigger: true,
  analysisPersonalizedAdvice: true,
});

export type InsertSpendingRecord = z.infer<typeof insertSpendingRecordSchema>;
export type SpendingRecord = typeof spendingRecordsTable.$inferSelect;
