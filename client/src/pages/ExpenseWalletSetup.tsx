import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseWalletSchema, type InsertExpenseWallet, type ExpenseWallet } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, Target, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function ExpenseWalletSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InsertExpenseWallet>({
    resolver: zodResolver(insertExpenseWalletSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  // Fetch current expense wallet
  const { data: currentWallet, isLoading } = useQuery<ExpenseWallet>({
    queryKey: ["/api/current-expense-wallet"],
  });

  // Fetch all expense wallets for history
  const { data: expenseWallets = [] } = useQuery<ExpenseWallet[]>({
    queryKey: ["/api/expense-wallets"],
  });

  // Create/Update expense wallet mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertExpenseWallet) => {
      if (currentWallet && !isEditing) {
        // If there's already a current wallet and we're not editing, update it
        return await apiRequest("PUT", `/api/expense-wallets/${currentWallet.id}`, data);
      } else {
        // Otherwise create a new one
        return await apiRequest("POST", "/api/expense-wallets", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/current-expense-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/wallet-summary"] });
      
      toast({
        title: "Success!",
        description: currentWallet ? "Expense wallet updated successfully" : "Expense wallet set successfully",
      });
      
      form.reset();
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save expense wallet. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving expense wallet:", error);
    },
  });

  const onSubmit = (values: InsertExpenseWallet) => {
    createMutation.mutate(values);
  };

  const handleEdit = () => {
    if (currentWallet) {
      form.setValue("amount", currentWallet.amount);
      form.setValue("description", currentWallet.description || "");
      setIsEditing(true);
    }
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
              <Link href="/">
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              
              <div className="md:ml-0 ml-2">
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Expense Wallet</h2>
                <p className="text-muted-foreground">Set and manage your expense wallet balance</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Current Expense Wallet Display */}
          {currentWallet && !isEditing && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <CardTitle>Current Expense Wallet Balance</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    data-testid="button-edit-current-wallet"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl text-muted-foreground">₹</span>
                    <span className="text-3xl font-bold text-foreground" data-testid="text-current-wallet-amount">
                      {parseFloat(currentWallet.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {currentWallet.description && (
                    <p className="text-muted-foreground" data-testid="text-current-wallet-description">
                      {currentWallet.description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(currentWallet.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expense Wallet Form */}
          {(!currentWallet || isEditing) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>{currentWallet ? "Update Expense Wallet" : "Set Expense Wallet"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wallet Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="10000.00"
                              {...field}
                              data-testid="input-wallet-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Initial wallet setup"
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-wallet-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-3">
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        data-testid="button-save-wallet"
                      >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {currentWallet ? "Update Wallet" : "Set Wallet"}
                      </Button>

                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            form.reset();
                          }}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {expenseWallets.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseWallets
                    .filter(wallet => wallet.id !== currentWallet?.id)
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5) // Show only last 5
                    .map((wallet) => (
                      <div
                        key={wallet.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                        data-testid={`item-previous-wallet-${wallet.id}`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-muted-foreground">₹</span>
                            <span className="font-medium text-foreground">
                              {parseFloat(wallet.amount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {wallet.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {wallet.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(wallet.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}