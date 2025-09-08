import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import AddExpense from "@/pages/AddExpense";
import AllExpenses from "@/pages/AllExpenses";
import Categories from "@/pages/Categories";
import BudgetSetup from "@/pages/BudgetSetup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/add-expense" component={AddExpense} />
      <Route path="/expenses" component={AllExpenses} />
      <Route path="/categories" component={Categories} />
      <Route path="/budget" component={BudgetSetup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
