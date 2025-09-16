import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

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

  // Colors for pie chart
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#8dd1e1",
    "#d084d0",
    "#ffb347",
    "#c0c0c0",
  ];

  const formatPieData = (data: any[]) => {
    return data.map((item, index) => ({
      ...item,
      value: parseFloat(item.totalAmount),
      fill: COLORS[index % COLORS.length],
    }));
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
                <BarChart data={formatTrendData(trendsData)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
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
          <div className="h-[300px]" data-testid="category-breakdown">
            {categoryLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">Loading chart...</span>
                </div>
              </div>
            ) : categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatPieData(categoryData)}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {formatPieData(categoryData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                  />
                  <Legend 
                    formatter={(value, entry) => (
                      <span style={{ color: "hsl(var(--foreground))" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No category data available</p>
                  <p className="text-xs">Add some expenses to see breakdown</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
