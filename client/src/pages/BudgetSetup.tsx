import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBudgetSchema, type InsertBudget } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Calendar, DollarSign } from "lucide-react";
import { MONTHS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function BudgetSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const form = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
      amount: "",
    },
  });

  // Fetch budgets
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["/api/budgets"],
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (data: InsertBudget) => {
      const response = await apiRequest("POST", "/api/budgets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      form.reset({ month: currentMonth, year: currentYear, amount: "" });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      const message = error.message.includes("already exists") 
        ? "Budget already exists for this month/year" 
        : "Failed to create budget";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Update budget mutation
  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBudget> }) => {
      const response = await apiRequest("PUT", `/api/budgets/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      form.reset({ month: currentMonth, year: currentYear, amount: "" });
      setEditingBudget(null);
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBudget) => {
    if (editingBudget) {
      updateBudgetMutation.mutate({ id: editingBudget.id, data });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    form.reset({
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    form.reset({ month: currentMonth, year: currentYear, amount: "" });
    setEditingBudget(null);
  };

  const formatBudgetPeriod = (month: number, year: number) => {
    return `${MONTHS[month - 1]} ${year}`;
  };

  const sortedBudgets = budgets.sort((a: any, b: any) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="md:ml-0 ml-16">
                <div className="flex items-center space-x-4">
                  <Link href="/">
                    <Button variant="ghost" size="sm" data-testid="button-back">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Budget Setup</h2>
                    <p className="text-muted-foreground">Manage budgets for different periods</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-budget">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBudget ? "Edit Budget" : "Add New Budget"}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Month</FormLabel>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-budget-month">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MONTHS.map((month, index) => (
                                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <Select
                              value={field.value.toString()}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-budget-year">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              data-testid="input-budget-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                        data-testid="button-save-budget"
                      >
                        {(createBudgetMutation.isPending || updateBudgetMutation.isPending) && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {editingBudget ? "Update" : "Create"} Budget
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        
        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-budgets-title">Budget Management</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Loading budgets...</span>
                  </div>
                </div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No budgets found</p>
                    <p className="text-xs">Create your first budget to get started</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedBudgets.map((budget: any) => {
                    const isCurrentMonth = budget.month === currentMonth && budget.year === currentYear;
                    return (
                      <Card 
                        key={budget.id} 
                        className={`transition-all hover:shadow-md ${isCurrentMonth ? 'ring-2 ring-primary' : ''}`}
                        data-testid={`card-budget-${budget.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className={`w-5 h-5 ${isCurrentMonth ? 'text-primary' : 'text-muted-foreground'}`} />
                              <h3 className="font-medium text-foreground" data-testid={`text-budget-period-${budget.id}`}>
                                {formatBudgetPeriod(budget.month, budget.year)}
                              </h3>
                            </div>
                            {isCurrentMonth && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-2xl font-bold text-foreground" data-testid={`text-budget-amount-${budget.id}`}>
                              {formatCurrency(budget.amount)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Created: {new Date(budget.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(budget)}
                                data-testid={`button-edit-${budget.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
