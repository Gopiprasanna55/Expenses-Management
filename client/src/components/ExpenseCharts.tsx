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
      amount: Number(item.amount) || 0,
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

  // Colors for pie chart - distinct colors like the reference image
  const COLORS = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple  
    "#A855F7", // Violet
    "#EC4899", // Pink
    "#EF4444", // Red
    "#F97316", // Orange
    "#EAB308", // Yellow
    "#84CC16", // Lime
    "#22C55E", // Green
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#0EA5E9", // Sky blue
    "#6366F1", // Indigo
    "#8B5A2B", // Brown
    "#6B7280", // Gray
  ];

  const formatPieData = (data: any[]) => {
    const total = data.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
    return data.map((item, index) => {
      const value = parseFloat(item.totalAmount);
      return {
        ...item,
        value,
        percentage: (value / total) * 100,
        fill: COLORS[index % COLORS.length],
      };
    });
  };

  // Custom label function to show percentage on pie slices
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is above 3% to avoid cluttering
    if (percent < 0.03) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
        style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Calculate total amount from trends data
  const totalAmount = trendsData?.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0) || 0;

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
          {/* Total Amount Display */}
          {trendsData && trendsData.length > 0 && (
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-total-amount">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Total for {getDaysLabel(trendDays)}
              </div>
            </div>
          )}
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
                <BarChart 
                  data={formatTrendData(trendsData)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid 
                    strokeDasharray="2 2" 
                    stroke="hsl(var(--border))" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
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
                    cx="45%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                    stroke="#fff"
                    strokeWidth={2}
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
                    formatter={(value: number, name: string, props: any) => [
                      `${formatCurrency(value)} (${(props.payload.percentage || 0).toFixed(1)}%)`,
                      name
                    ]}
                  />
                  <Legend 
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                      fontSize: '12px',
                      paddingLeft: '20px'
                    }}
                    formatter={(value: string) => (
                      <span style={{ color: "hsl(var(--foreground))", fontSize: '12px' }}>
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
