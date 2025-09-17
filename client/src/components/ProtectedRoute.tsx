import { useAuthState } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, login } = useAuthState();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <LogIn className="h-12 w-12 mx-auto text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Authentication Required</h2>
                <p className="text-muted-foreground mt-2">
                  Please sign in with your Microsoft account to access the expense tracking system.
                </p>
              </div>
              <Button onClick={login} className="w-full" data-testid="button-login-required">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In with Microsoft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-destructive" />
              <div>
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">
                  You don't have permission to access this page. Administrator privileges are required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}