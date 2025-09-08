import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface ExpenseChartsProps {
  month?: number;
  year?: number;
}

export default function ExpenseCharts({ month, year }: ExpenseChartsProps) {
  const [trendDays, setTrendDays] = useState("7");

  // Fetch expense trends
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ["/api/analytics/expense-trends", trendDays],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/expense-trends/${trendDays}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Fetch category breakdown
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/analytics/category-breakdown", month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const response = await fetch(`/api/analytics/category-breakdown?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const formatTrendData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric' 
      }),
    }));
  };

  const getDaysLabel = (days: string) => {
    switch (days) {
      case "7": return "Last 7 days";
      case "30": return "Last 30 days";
      case "90": return "Last 3 months";
      default: return "Last 7 days";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Expense Trends</CardTitle>
            <Select value={trendDays} onValueChange={setTrendDays}>
              <SelectTrigger className="w-40" data-testid="select-trend-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]" data-testid="chart-expense-trends">
            {trendsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </div>
            ) : trendsData && trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatTrendData(trendsData)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No data available</p>
                  <p className="text-xs">Add some expenses to see trends</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Category Breakdown</CardTitle>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="category-breakdown">
            {categoryLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-muted rounded-full" />
                      <div className="w-24 h-4 bg-muted rounded" />
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-4 bg-muted rounded mb-1" />
                      <div className="w-8 h-3 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : categoryData && categoryData.length > 0 ? (
              categoryData.slice(0, 6).map((category: any) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-foreground" data-testid={`text-category-${category.id}`}>
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground" data-testid={`text-amount-${category.id}`}>
                      ${category.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`text-percentage-${category.id}`}>
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📊</div>
                <p>No category data available</p>
                <p className="text-xs">Add some expenses to see breakdown</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
