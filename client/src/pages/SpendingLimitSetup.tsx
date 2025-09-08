import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSpendingLimitSchema, type InsertSpendingLimit, type SpendingLimit } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader2, Target, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SpendingLimitSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<InsertSpendingLimit>({
    resolver: zodResolver(insertSpendingLimitSchema),
    defaultValues: {
      amount: "",
      description: "",
    },
  });

  // Fetch current spending limit
  const { data: currentLimit, isLoading } = useQuery<SpendingLimit>({
    queryKey: ["/api/current-spending-limit"],
  });

  // Fetch all spending limits for history
  const { data: spendingLimits = [] } = useQuery<SpendingLimit[]>({
    queryKey: ["/api/spending-limits"],
  });

  // Create/Update spending limit mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertSpendingLimit) => {
      if (currentLimit && !isEditing) {
        // If there's already a current limit and we're not editing, update it
        return await apiRequest("PUT", `/api/spending-limits/${currentLimit.id}`, data);
      } else {
        // Otherwise create a new one
        return await apiRequest("POST", "/api/spending-limits", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/current-spending-limit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spending-limits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/spending-summary"] });
      
      toast({
        title: "Success!",
        description: currentLimit ? "Spending limit updated successfully" : "Spending limit set successfully",
      });
      
      form.reset();
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save spending limit. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving spending limit:", error);
    },
  });

  const onSubmit = (values: InsertSpendingLimit) => {
    createMutation.mutate(values);
  };

  const handleEdit = () => {
    if (currentLimit) {
      form.setValue("amount", currentLimit.amount);
      form.setValue("description", currentLimit.description || "");
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
                <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">Spending Limit</h2>
                <p className="text-muted-foreground">Set and manage your expense spending limit</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Current Spending Limit Display */}
          {currentLimit && !isEditing && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <CardTitle>Current Spending Limit</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    data-testid="button-edit-current-limit"
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
                    <span className="text-3xl font-bold text-foreground" data-testid="text-current-limit-amount">
                      {parseFloat(currentLimit.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {currentLimit.description && (
                    <p className="text-muted-foreground" data-testid="text-current-limit-description">
                      {currentLimit.description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(currentLimit.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spending Limit Form */}
          {(!currentLimit || isEditing) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>{currentLimit ? "Update Spending Limit" : "Set Spending Limit"}</span>
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
                          <FormLabel>Spending Limit Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="10000.00"
                              {...field}
                              data-testid="input-spending-limit-amount"
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
                              placeholder="e.g., Monthly expense allowance"
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-spending-limit-description"
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
                        data-testid="button-save-spending-limit"
                      >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {currentLimit ? "Update Limit" : "Set Limit"}
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
          {spendingLimits.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spendingLimits
                    .filter(limit => limit.id !== currentLimit?.id)
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5) // Show only last 5
                    .map((limit) => (
                      <div
                        key={limit.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                        data-testid={`item-previous-limit-${limit.id}`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg text-muted-foreground">₹</span>
                            <span className="font-medium text-foreground">
                              {parseFloat(limit.amount).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {limit.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {limit.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(limit.updatedAt).toLocaleDateString()}
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