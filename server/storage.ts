import { type Category, type InsertCategory, type Budget, type InsertBudget, type Expense, type InsertExpense, type UpdateExpense, type ExpenseWithCategory, type BudgetSummary, type CategoryBreakdown, type ExpenseFilters, type ExpenseSortBy, type SortOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Budget operations
  getBudgets(): Promise<Budget[]>;
  getBudgetByMonthYear(month: number, year: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;
  
  // Expense operations
  getExpenses(filters?: ExpenseFilters, sortBy?: ExpenseSortBy, sortOrder?: SortOrder, limit?: number, offset?: number): Promise<ExpenseWithCategory[]>;
  getExpenseById(id: string): Promise<ExpenseWithCategory | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<UpdateExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  getExpensesCount(filters?: ExpenseFilters): Promise<number>;
  
  // Analytics operations
  getBudgetSummary(month: number, year: number): Promise<BudgetSummary>;
  getCategoryBreakdown(month?: number, year?: number): Promise<CategoryBreakdown[]>;
  getExpenseTrends(days: number): Promise<{ date: string; amount: number }[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private budgets: Map<string, Budget>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.categories = new Map();
    this.budgets = new Map();
    this.expenses = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default categories
    const defaultCategories = [
      { name: "Office Supplies", color: "#3b82f6", description: "Office materials, stationery, and supplies" },
      { name: "Travel", color: "#10b981", description: "Business travel expenses" },
      { name: "Meals & Entertainment", color: "#f59e0b", description: "Client meals and entertainment" },
      { name: "Utilities", color: "#8b5cf6", description: "Office utilities and services" },
      { name: "Other", color: "#6b7280", description: "Other business expenses" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, {
        id,
        ...cat,
        isActive: 1,
      });
    });

    // Initialize current month budget
    const now = new Date();
    const budgetId = randomUUID();
    this.budgets.set(budgetId, {
      id: budgetId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: "5000.00",
      createdAt: now,
    });
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive === 1);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = {
      id,
      ...category,
      isActive: 1,
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = this.categories.get(id);
    if (!category) return false;

    // Soft delete by setting isActive to 0
    category.isActive = 0;
    this.categories.set(id, category);
    return true;
  }

  // Budget operations
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudgetByMonthYear(month: number, year: number): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      budget => budget.month === month && budget.year === year
    );
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const newBudget: Budget = {
      id,
      ...budget,
      createdAt: new Date(),
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...budget };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Expense operations
  async getExpenses(
    filters?: ExpenseFilters,
    sortBy: ExpenseSortBy = 'date',
    sortOrder: SortOrder = 'desc',
    limit = 50,
    offset = 0
  ): Promise<ExpenseWithCategory[]> {
    let expenses = Array.from(this.expenses.values());

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        expenses = expenses.filter(exp => 
          exp.description.toLowerCase().includes(searchLower) ||
          (exp.vendor && exp.vendor.toLowerCase().includes(searchLower))
        );
      }

      if (filters.categoryId) {
        expenses = expenses.filter(exp => exp.categoryId === filters.categoryId);
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        expenses = expenses.filter(exp => new Date(exp.date) >= startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        expenses = expenses.filter(exp => new Date(exp.date) <= endDate);
      }

      if (filters.minAmount !== undefined) {
        expenses = expenses.filter(exp => parseFloat(exp.amount) >= filters.minAmount!);
      }

      if (filters.maxAmount !== undefined) {
        expenses = expenses.filter(exp => parseFloat(exp.amount) <= filters.maxAmount!);
      }
    }

    // Apply sorting
    expenses.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'amount':
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case 'description':
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
        case 'category':
          const catA = this.categories.get(a.categoryId);
          const catB = this.categories.get(b.categoryId);
          aVal = catA?.name?.toLowerCase() || '';
          bVal = catB?.name?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const paginatedExpenses = expenses.slice(offset, offset + limit);

    // Enrich with category data
    return paginatedExpenses.map(expense => ({
      ...expense,
      category: this.categories.get(expense.categoryId)!
    }));
  }

  async getExpenseById(id: string): Promise<ExpenseWithCategory | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const category = this.categories.get(expense.categoryId);
    if (!category) return undefined;

    return { ...expense, category };
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const now = new Date();
    const newExpense: Expense = {
      id,
      ...expense,
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: string, expense: Partial<UpdateExpense>): Promise<Expense | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...expense,
      updatedAt: new Date(),
    };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesCount(filters?: ExpenseFilters): Promise<number> {
    const expenses = await this.getExpenses(filters, 'date', 'desc', 999999, 0);
    return expenses.length;
  }

  // Analytics operations
  async getBudgetSummary(month: number, year: number): Promise<BudgetSummary> {
    // Get all budgets for the month/year and sum them
    const budgets = Array.from(this.budgets.values()).filter(b => 
      b.month === month && b.year === year
    );
    const monthlyBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);

    // Get expenses for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    const monthExpenses = Array.from(this.expenses.values()).filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    });

    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const budgetRemaining = monthlyBudget - totalExpenses;
    const expenseCount = monthExpenses.length;

    // Calculate daily average
    const now = new Date();
    const currentDay = now.getFullYear() === year && now.getMonth() + 1 === month 
      ? now.getDate() 
      : endOfMonth.getDate();
    
    const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0;
    
    // Calculate projected total
    const daysInMonth = endOfMonth.getDate();
    const projectedTotal = dailyAverage * daysInMonth;
    
    // Days left in month
    const daysLeft = now.getFullYear() === year && now.getMonth() + 1 === month
      ? daysInMonth - now.getDate()
      : 0;

    const percentageUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

    return {
      monthlyBudget,
      totalExpenses,
      budgetRemaining,
      expenseCount,
      dailyAverage,
      projectedTotal,
      daysLeft,
      percentageUsed,
    };
  }

  async getCategoryBreakdown(month?: number, year?: number): Promise<CategoryBreakdown[]> {
    let expenses = Array.from(this.expenses.values());

    // Filter by month/year if provided
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      
      expenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startOfMonth && expDate <= endOfMonth;
      });
    }

    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Group by category
    const categoryMap = new Map<string, { totalAmount: number; count: number }>();
    
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.categoryId) || { totalAmount: 0, count: 0 };
      categoryMap.set(expense.categoryId, {
        totalAmount: existing.totalAmount + parseFloat(expense.amount),
        count: existing.count + 1,
      });
    });

    // Build category breakdown
    const breakdown: CategoryBreakdown[] = [];
    
    for (const [categoryId, data] of categoryMap.entries()) {
      const category = this.categories.get(categoryId);
      if (category) {
        breakdown.push({
          ...category,
          totalAmount: data.totalAmount,
          percentage: totalAmount > 0 ? (data.totalAmount / totalAmount) * 100 : 0,
          expenseCount: data.count,
        });
      }
    }

    return breakdown.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getExpenseTrends(days: number): Promise<{ date: string; amount: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const expenses = Array.from(this.expenses.values()).filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });

    // Group by date
    const dateMap = new Map<string, number>();
    
    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    // Add actual expenses
    expenses.forEach(expense => {
      const dateStr = new Date(expense.date).toISOString().split('T')[0];
      const existing = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, existing + parseFloat(expense.amount));
    });

    return Array.from(dateMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const storage = new MemStorage();
