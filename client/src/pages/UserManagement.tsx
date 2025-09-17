import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@shared/schema";
import { Users, Shield, UserCheck, UserX, RefreshCw } from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'activate' | 'deactivate';
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    action: 'activate',
    userName: ''
  });

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json() as Promise<User[]>;
    }
  });

  // Toggle user active status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/users/${userId}/status`, { isActive: isActive ? 1 : 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User status updated",
        description: "User access has been successfully updated.",
      });
      setConfirmDialog({ isOpen: false, userId: '', action: 'activate', userName: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  });

  const handleStatusToggle = (user: User, newStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      action: newStatus ? 'activate' : 'deactivate',
      userName: user.name
    });
  };

  const confirmStatusChange = () => {
    toggleUserStatusMutation.mutate({
      userId: confirmDialog.userId,
      isActive: confirmDialog.action === 'activate'
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p>You don't have permission to view user management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
              <p>Loading user management...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user access and permissions for the expense tracking system
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {users?.length || 0} Total Users
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Users will appear here after they sign in for the first time.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium" data-testid={`text-name-${user.id}`}>
                      {user.name}
                    </TableCell>
                    <TableCell data-testid={`text-email-${user.id}`}>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        data-testid={`badge-role-${user.id}`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={Boolean(user.isActive) ? 'default' : 'destructive'}
                        data-testid={`badge-status-${user.id}`}
                      >
                        {Boolean(user.isActive) ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-joined-${user.id}`}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={Boolean(user.isActive)}
                          onCheckedChange={(checked) => handleStatusToggle(user, checked)}
                          disabled={toggleUserStatusMutation.isPending}
                          data-testid={`switch-status-${user.id}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {Boolean(user.isActive) ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'activate' ? (
                <UserCheck className="h-5 w-5 text-green-600" />
              ) : (
                <UserX className="h-5 w-5 text-red-600" />
              )}
              {confirmDialog.action === 'activate' ? 'Activate User' : 'Deactivate User'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action} <strong>{confirmDialog.userName}</strong>?
              {confirmDialog.action === 'deactivate' && 
                " This user will lose access to the expense tracking system."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              data-testid="button-cancel-status-change"
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.action === 'activate' ? 'default' : 'destructive'}
              onClick={confirmStatusChange}
              disabled={toggleUserStatusMutation.isPending}
              data-testid="button-confirm-status-change"
            >
              {toggleUserStatusMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {confirmDialog.action === 'activate' ? 'Activate' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}