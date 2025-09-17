import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import BudgetCards from "@/components/BudgetCards";
import ExpenseCharts from "@/components/ExpenseCharts";
import ExpenseTable from "@/components/ExpenseTable";
import MonthYearSelector from "@/components/MonthYearSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, Download, Tags, Bell, User, Calendar } from "lucide-react";
import ExcelImport from "@/components/ExcelImport";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Fetch budget summary for progress display
  const { data: budgetSummary } = useQuery({
    queryKey: ["/api/analytics/budget-summary", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/budget-summary/${selectedMonth}/${selectedYear}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    window.open(`/api/export/csv?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="md:ml-0 ml-16"> {/* Offset for mobile menu button */}
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, Accounting Manager</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex">
                <MonthYearSelector
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onMonthYearChange={handleMonthYearChange}
                />
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Wallet Overview Cards */}
          <BudgetCards month={selectedMonth} year={selectedYear} />
          
          {/* Wallet Progress and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Progress */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Monthly Expense Tracking</CardTitle>
                    <div className="text-sm text-muted-foreground" data-testid="text-budget-usage">
                      {budgetSummary ? `${(budgetSummary.percentageUsed || 0).toFixed(1)}% of wallet used this month` : "Loading... "}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {budgetSummary && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Monthly Usage</span>
                          <span className="font-medium text-foreground" data-testid="text-progress-amount">
                            {formatCurrency(budgetSummary.totalExpenses)} from {formatCurrency(budgetSummary.walletAmount)} wallet
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div 
                            className="h-3 rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-300"
                            style={{ width: `${Math.min(budgetSummary.percentageUsed || 0, 100)}%` }}
                            data-testid="progress-expense-bar"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground" data-testid="text-daily-average">
                            {formatCurrency(budgetSummary.dailyAverage)}
                          </div>
                          <div className="text-xs text-muted-foreground">Daily Average</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground" data-testid="text-projected-spend">
                            {formatCurrency(budgetSummary.projectedTotal)}
                          </div>
                          <div className="text-xs text-muted-foreground">Projected Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-secondary" data-testid="text-days-left">
                            {budgetSummary.daysLeft}
                          </div>
                          <div className="text-xs text-muted-foreground">Days Left</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Link href="/add-expense">
                    <Button className="w-full justify-start h-12" data-testid="button-add-expense">
                      <Plus className="w-4 h-4 mr-3" />
                      Add New Expense
                    </Button>
                  </Link>
                  
                  <ExcelImport />
                  
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start h-12"
                    onClick={handleExportCSV}
                    data-testid="button-export-excel"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    Export to Excel
                  </Button>
                  
                  <Link href="/categories">
                    <Button variant="secondary" className="w-full justify-start h-12" data-testid="button-manage-categories">
                      <Tags className="w-4 h-4 mr-3" />
                      Manage Categories
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts and Category Breakdown */}
          <ExpenseCharts month={selectedMonth} year={selectedYear} />
          
          {/* Recent Expenses */}
          <ExpenseTable 
            limit={10} 
            title="Recent Expenses"
            showFilters={false}
          />
        </main>
      </div>
    </div>
  );
}
