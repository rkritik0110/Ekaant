import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Shield, ShieldOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

interface UserAccess {
  user_id: string;
  is_allowed: boolean;
  blocked_reason: string | null;
  profile?: {
    full_name: string | null;
  };
  subscription?: {
    is_active: boolean;
    valid_until: string;
  } | null;
}

export function AccessControl() {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with their access status
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .limit(50);

      if (error) throw error;

      // Fetch access control
      const { data: accessControls } = await supabase
        .from("access_control")
        .select("*");

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, is_active, valid_until")
        .eq("is_active", true);

      const accessMap = new Map(accessControls?.map(a => [a.user_id, a]));
      const subMap = new Map(subscriptions?.map(s => [s.user_id, s]));

      const userList: UserAccess[] = profiles?.map(p => ({
        user_id: p.user_id,
        is_allowed: accessMap.get(p.user_id)?.is_allowed ?? true,
        blocked_reason: accessMap.get(p.user_id)?.blocked_reason ?? null,
        profile: { full_name: p.full_name },
        subscription: subMap.get(p.user_id) || null,
      })) || [];

      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAccess = async (userId: string, currentStatus: boolean) => {
    try {
      const { data: existing } = await supabase
        .from("access_control")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("access_control")
          .update({
            is_allowed: !currentStatus,
            blocked_at: !currentStatus ? null : new Date().toISOString(),
            blocked_reason: !currentStatus ? null : "Payment pending",
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("access_control").insert({
          user_id: userId,
          is_allowed: !currentStatus,
          blocked_at: !currentStatus ? null : new Date().toISOString(),
          blocked_reason: !currentStatus ? null : "Payment pending",
        });

        if (error) throw error;
      }

      toast.success(`Access ${!currentStatus ? "granted" : "blocked"}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling access:", error);
      toast.error("Failed to update access");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Access Control
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No users found"
            description="Users will appear here once they sign up"
            className="py-8"
          />
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.user_id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  user.is_allowed ? "border-border" : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    user.is_allowed ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {user.is_allowed ? (
                      <Shield className="h-4 w-4 text-success" />
                    ) : (
                      <ShieldOff className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.profile?.full_name || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2">
                      {user.subscription ? (
                        <Badge variant="outline" className="text-xs text-success">
                          Active Sub
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          No Sub
                        </Badge>
                      )}
                      {!user.is_allowed && (
                        <span className="text-xs text-destructive">
                          {user.blocked_reason || "Blocked"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant={user.is_allowed ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleAccess(user.user_id, user.is_allowed)}
                >
                  {user.is_allowed ? "Block" : "Allow"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
