import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Edit, Trash2, Paperclip, ChevronUp, ChevronDown } from "lucide-react";
import type { ExpenseFilters, ExpenseSortBy, SortOrder, Category } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface ExpenseTableProps {
  showFilters?: boolean;
  limit?: number;
  title?: string;
}

export default function ExpenseTable({ showFilters = true, limit = 50, title = "Expenses" }: ExpenseTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [sortBy, setSortBy] = useState<ExpenseSortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch expenses
  const { data: expenseData, isLoading } = useQuery({
    queryKey: ["/api/expenses", filters, sortBy, sortOrder, limit, currentPage * limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount !== undefined && { minAmount: filters.minAmount.toString() }),
        ...(filters.maxAmount !== undefined && { maxAmount: filters.maxAmount.toString() }),
        sortBy,
        sortOrder,
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
      });

      const response = await fetch(`/api/expenses?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleSort = (column: ExpenseSortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(0);
  };

  const handleFilterChange = (key: keyof ExpenseFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setCurrentPage(0);
  };

  const expenses = expenseData?.expenses || [];
  const totalCount = expenseData?.totalCount || 0;
  const hasMore = expenseData?.hasMore || false;

  const getSortIcon = (column: ExpenseSortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || '#6b7280';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <CardTitle data-testid="text-expenses-title">{title}</CardTitle>
          
          {showFilters && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  data-testid="input-search"
                />
              </div>
              
              <Select value={filters.categoryId || ''} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  placeholder="Start date"
                  data-testid="input-start-date"
                />
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  placeholder="End date"
                  data-testid="input-end-date"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1 hover:text-foreground p-0 h-auto"
                    onClick={() => handleSort('date')}
                    data-testid="button-sort-date"
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-1 hover:text-foreground p-0 h-auto"
                    onClick={() => handleSort('amount')}
                    data-testid="button-sort-amount"
                  >
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </Button>
                </TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground">Loading expenses...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {Object.keys(filters).length > 0 ? "No expenses found matching your filters" : "No expenses found"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense: any) => (
                  <TableRow key={expense.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-expense-${expense.id}`}>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground" data-testid={`text-expense-date-${expense.id}`}>
                        {formatDate(expense.date)}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`text-expense-time-${expense.id}`}>
                        {formatTime(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-foreground" data-testid={`text-expense-description-${expense.id}`}>
                        {expense.description}
                      </div>
                      {expense.vendor && (
                        <div className="text-xs text-muted-foreground" data-testid={`text-expense-vendor-${expense.id}`}>
                          {expense.vendor}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        style={{ backgroundColor: `${getCategoryColor(expense.categoryId)}20`, color: getCategoryColor(expense.categoryId) }}
                        data-testid={`badge-category-${expense.id}`}
                      >
                        {expense.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-foreground" data-testid={`text-expense-amount-${expense.id}`}>
                        {formatCurrency(expense.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.receiptPath ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-secondary" />
                          <a
                            href={expense.receiptPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            data-testid={`link-receipt-${expense.id}`}
                          >
                            receipt
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No receipt</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          data-testid={`button-view-${expense.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          data-testid={`button-edit-${expense.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteExpenseMutation.mutate(expense.id)}
                          disabled={deleteExpenseMutation.isPending}
                          data-testid={`button-delete-${expense.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {expenses.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalCount)} of {totalCount} expenses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  data-testid="button-previous-page"
                >
                  Previous
                </Button>
                <span className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded">
                  {currentPage + 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasMore}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
