import { type Category, type InsertCategory, type ExpenseWallet, type InsertExpenseWallet, type UpdateExpenseWallet, type Expense, type InsertExpense, type UpdateExpense, type ExpenseWithCategory, type WalletSummary, type CategoryBreakdown, type ExpenseFilters, type ExpenseSortBy, type SortOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Spending Limit operations
  getExpenseWallets(): Promise<ExpenseWallet[]>;
  getCurrentExpenseWallet(): Promise<ExpenseWallet | undefined>;
  createExpenseWallet(wallet: InsertExpenseWallet): Promise<ExpenseWallet>;
  updateExpenseWallet(id: string, wallet: Partial<InsertExpenseWallet>): Promise<ExpenseWallet | undefined>;
  deleteExpenseWallet(id: string): Promise<boolean>;
  
  // Expense operations
  getExpenses(filters?: ExpenseFilters, sortBy?: ExpenseSortBy, sortOrder?: SortOrder, limit?: number, offset?: number): Promise<ExpenseWithCategory[]>;
  getExpenseById(id: string): Promise<ExpenseWithCategory | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<UpdateExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  getExpensesCount(filters?: ExpenseFilters): Promise<number>;
  
  // Analytics operations
  getWalletSummary(): Promise<WalletSummary>;
  getWalletSummaryForMonth(month: number, year: number): Promise<WalletSummary>;
  getCategoryBreakdown(month?: number, year?: number): Promise<CategoryBreakdown[]>;
  getExpenseTrends(days: number): Promise<{ date: string; amount: number }[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private expenseWallets: Map<string, ExpenseWallet>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.categories = new Map();
    this.expenseWallets = new Map();
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

    // Initialize default expense wallet
    const now = new Date();
    const limitId = randomUUID();
    this.expenseWallets.set(limitId, {
      id: limitId,
      amount: "10000.00",
      description: "Initial wallet amount",
      createdAt: now,
      updatedAt: now,
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

  // Expense Wallet operations
  async getExpenseWallets(): Promise<ExpenseWallet[]> {
    return Array.from(this.expenseWallets.values());
  }

  async getCurrentExpenseWallet(): Promise<ExpenseWallet | undefined> {
    const wallets = Array.from(this.expenseWallets.values());
    // For simplified system, return the most recent one
    return wallets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  }

  async createExpenseWallet(wallet: InsertExpenseWallet): Promise<ExpenseWallet> {
    const id = randomUUID();
    const now = new Date();
    const newWallet: ExpenseWallet = {
      id,
      ...wallet,
      createdAt: now,
      updatedAt: now,
    };
    this.expenseWallets.set(id, newWallet);
    return newWallet;
  }

  async updateExpenseWallet(id: string, wallet: Partial<InsertExpenseWallet>): Promise<ExpenseWallet | undefined> {
    const existing = this.expenseWallets.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...wallet,
      updatedAt: new Date(),
    };
    this.expenseWallets.set(id, updated);
    return updated;
  }

  async deleteExpenseWallet(id: string): Promise<boolean> {
    return this.expenseWallets.delete(id);
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
  async getWalletSummary(): Promise<WalletSummary> {
    // Calculate total wallet amount from all wallet entries
    const allWallets = Array.from(this.expenseWallets.values());
    const walletAmount = allWallets.reduce((total, wallet) => total + parseFloat(wallet.amount), 0);

    // Get all expenses
    const allExpenses = Array.from(this.expenses.values());
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const remainingAmount = walletAmount - totalExpenses;
    const expenseCount = allExpenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    const percentageUsed = walletAmount > 0 ? (totalExpenses / walletAmount) * 100 : 0;

    return {
      walletAmount,
      totalExpenses,
      remainingAmount,
      expenseCount,
      averageExpense,
      percentageUsed,
    };
  }

  async getWalletSummaryForMonth(month: number, year: number): Promise<WalletSummary> {
    // Calculate total wallet amount from all wallet entries
    const allWallets = Array.from(this.expenseWallets.values());
    const monthlyBudget = allWallets.reduce((total, wallet) => total + parseFloat(wallet.amount), 0);

    // Filter expenses for the specific month and year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    let monthlyExpenses = Array.from(this.expenses.values()).filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startOfMonth && expDate <= endOfMonth;
    });

    const totalExpenses = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const remainingAmount = monthlyBudget - totalExpenses;
    const expenseCount = monthlyExpenses.length;
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
    const percentageUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

    // Calculate daily average for the month
    const currentDate = new Date();
    const daysInMonth = endOfMonth.getDate();
    const isCurrentMonth = currentDate.getMonth() === month - 1 && currentDate.getFullYear() === year;
    const daysPassed = isCurrentMonth ? currentDate.getDate() : daysInMonth;
    const dailyAverage = daysPassed > 0 ? totalExpenses / daysPassed : 0;
    
    // Calculate projected total (if current month)
    const projectedTotal = isCurrentMonth && daysPassed > 0 ? (dailyAverage * daysInMonth) : totalExpenses;
    
    // Calculate days left in month
    const currentYear = currentDate.getFullYear();
    const daysLeft = isCurrentMonth ? daysInMonth - currentDate.getDate() : 
                     (year > currentYear || (year === currentYear && month > currentDate.getMonth() + 1)) ? daysInMonth : 0;

    return {
      walletAmount: monthlyBudget,
      monthlyBudget,
      totalExpenses,
      remainingAmount,
      expenseCount,
      averageExpense,
      percentageUsed,
      dailyAverage,
      projectedTotal,
      daysLeft,
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
