import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3b82f6"),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
});

export const spendingLimits = pgTable("spending_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  vendor: text("vendor"),
  date: timestamp("date").notNull(),
  receiptPath: text("receipt_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  isActive: true,
});

export const insertSpendingLimitSchema = createInsertSchema(spendingLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSpendingLimitSchema = insertSpendingLimitSchema.partial().extend({
  id: z.string(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.string().transform((val) => new Date(val)),
});

export const updateExpenseSchema = insertExpenseSchema.partial().extend({
  id: z.string(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type SpendingLimit = typeof spendingLimits.$inferSelect;
export type InsertSpendingLimit = z.infer<typeof insertSpendingLimitSchema>;
export type UpdateSpendingLimit = z.infer<typeof updateSpendingLimitSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type UpdateExpense = z.infer<typeof updateExpenseSchema>;

// Extended types for API responses
export type ExpenseWithCategory = Expense & {
  category: Category;
};

export type SpendingSummary = {
  totalLimit: number;
  totalExpenses: number;
  remainingAmount: number;
  expenseCount: number;
  averageExpense: number;
  percentageUsed: number;
};

export type CategoryBreakdown = Category & {
  totalAmount: number;
  percentage: number;
  expenseCount: number;
};

export type ExpenseFilters = {
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
};

export type ExpenseSortBy = 'date' | 'amount' | 'description' | 'category';
export type SortOrder = 'asc' | 'desc';
