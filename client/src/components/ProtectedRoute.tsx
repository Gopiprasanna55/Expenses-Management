import { useAuthState } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import fdesLogo from "@assets/image_1758110732910.png";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center space-y-6">
              {/* FDES Logo */}
              <div className="flex items-center justify-center">
                <img 
                  src={fdesLogo} 
                  alt="FDES Logo" 
                  className="h-16 w-auto object-contain"
                />
              </div>
              
              {/* Title and Subtitle */}
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-gray-800">Expense Tracker</h2>
                <p className="text-lg text-gray-600">Sign in to your account</p>
              </div>
              
              {/* Microsoft Sign In Button */}
              <div className="pt-2">
                <Button 
                  onClick={login} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 text-lg font-medium rounded-lg flex items-center justify-center space-x-3" 
                  data-testid="button-login-required"
                >
                  <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-px w-3 h-3">
                      <div className="bg-red-500 w-1.5 h-1.5"></div>
                      <div className="bg-green-500 w-1.5 h-1.5"></div>
                      <div className="bg-blue-500 w-1.5 h-1.5"></div>
                      <div className="bg-yellow-500 w-1.5 h-1.5"></div>
                    </div>
                  </div>
                  <span>Sign in with Microsoft Account</span>
                </Button>
              </div>
              
              {/* Version */}
              <div className="pt-4">
                <p className="text-gray-500 text-sm font-medium">V1.0 SEPT 2025</p>
              </div>
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