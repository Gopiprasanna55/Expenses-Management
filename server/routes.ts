import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertBudgetSchema, insertExpenseSchema, updateExpenseSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(400).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.get("/api/budgets/:month/:year", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      
      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid month or year" });
      }
      
      const budget = await storage.getBudgetByMonthYear(month, year);
      
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ error: "Failed to fetch budget" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      
      // Check if budget already exists for this month/year
      const existing = await storage.getBudgetByMonthYear(budgetData.month, budgetData.year);
      if (existing) {
        return res.status(400).json({ error: "Budget already exists for this month/year" });
      }
      
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(400).json({ error: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const budgetData = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, budgetData);
      
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(400).json({ error: "Failed to update budget" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { 
        search, 
        categoryId, 
        startDate, 
        endDate, 
        minAmount, 
        maxAmount,
        sortBy = 'date',
        sortOrder = 'desc',
        limit = '50',
        offset = '0'
      } = req.query;

      const filters = {
        search: search as string,
        categoryId: categoryId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === '') {
          delete filters[key as keyof typeof filters];
        }
      });

      const expenses = await storage.getExpenses(
        Object.keys(filters).length > 0 ? filters : undefined,
        sortBy as any,
        sortOrder as any,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const totalCount = await storage.getExpensesCount(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.json({
        expenses,
        totalCount,
        hasMore: parseInt(offset as string) + expenses.length < totalCount,
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const expense = await storage.getExpenseById(id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ error: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const expenseData = updateExpenseSchema.parse({ ...req.body, id });
      const expense = await storage.updateExpense(id, expenseData);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(400).json({ error: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/budget-summary/:month/:year", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      
      if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid month or year" });
      }
      
      const summary = await storage.getBudgetSummary(month, year);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      res.status(500).json({ error: "Failed to fetch budget summary" });
    }
  });

  app.get("/api/analytics/category-breakdown", async (req, res) => {
    try {
      const { month, year } = req.query;
      const monthNum = month ? parseInt(month as string) : undefined;
      const yearNum = year ? parseInt(year as string) : undefined;
      
      const breakdown = await storage.getCategoryBreakdown(monthNum, yearNum);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      res.status(500).json({ error: "Failed to fetch category breakdown" });
    }
  });

  app.get("/api/analytics/expense-trends/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      
      if (isNaN(days) || days < 1) {
        return res.status(400).json({ error: "Invalid days parameter" });
      }
      
      const trends = await storage.getExpenseTrends(days);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching expense trends:", error);
      res.status(500).json({ error: "Failed to fetch expense trends" });
    }
  });

  // Export routes
  app.get("/api/export/csv", async (req, res) => {
    try {
      const { 
        search, 
        categoryId, 
        startDate, 
        endDate, 
        minAmount, 
        maxAmount 
      } = req.query;

      const filters = {
        search: search as string,
        categoryId: categoryId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined || filters[key as keyof typeof filters] === '') {
          delete filters[key as keyof typeof filters];
        }
      });

      const expenses = await storage.getExpenses(
        Object.keys(filters).length > 0 ? filters : undefined,
        'date',
        'desc',
        999999, // Get all expenses for export
        0
      );

      // Convert to CSV format
      const csvData = [
        ['Date', 'Description', 'Category', 'Vendor', 'Amount', 'Notes'].join(','),
        ...expenses.map(expense => [
          new Date(expense.date).toLocaleDateString(),
          `"${expense.description.replace(/"/g, '""')}"`,
          `"${expense.category.name.replace(/"/g, '""')}"`,
          expense.vendor ? `"${expense.vendor.replace(/"/g, '""')}"` : '',
          expense.amount,
          expense.notes ? `"${expense.notes.replace(/"/g, '""')}"` : '',
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Object storage routes for receipts
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
