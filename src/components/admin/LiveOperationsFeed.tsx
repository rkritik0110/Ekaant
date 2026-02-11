import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Radio, Check, Coffee, Droplets, Volume2, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";

interface SilentRequest {
  id: string;
  user_id: string;
  cabin_id: string | null;
  request_type: "water" | "coffee" | "noise_complaint" | "assistance";
  status: "pending" | "acknowledged" | "completed";
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  // joined
  user_name?: string;
  cabin_number?: number | null;
}

const requestConfig: Record<
  string,
  { icon: React.ElementType; label: string; badgeClass: string }
> = {
  water: {
    icon: Droplets,
    label: "Water",
    badgeClass: "bg-info/10 text-info border-info/20",
  },
  coffee: {
    icon: Coffee,
    label: "Coffee",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
  },
  noise_complaint: {
    icon: Volume2,
    label: "Noise Complaint",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  assistance: {
    icon: HelpCircle,
    label: "Assistance",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
};

export function LiveOperationsFeed() {
  const [requests, setRequests] = useState<SilentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // Fetch silent_requests with cabin info (no FK to profiles, so fetch separately)
      const { data, error } = await supabase
        .from("silent_requests")
        .select("*, cabins(cabin_number)")
        .in("status", ["pending", "acknowledged"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names for the user_ids
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      let profileMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        profileMap = (profiles || []).reduce((acc: Record<string, string>, p: any) => {
          acc[p.user_id] = p.full_name || "Unknown User";
          return acc;
        }, {});
      }

      const mapped: SilentRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        cabin_id: r.cabin_id,
        request_type: r.request_type,
        status: r.status,
        notes: r.notes,
        created_at: r.created_at,
        resolved_at: r.resolved_at,
        user_name: profileMap[r.user_id] || "Unknown User",
        cabin_number: r.cabins?.cabin_number || null,
      }));

      setRequests(mapped);
    } catch (error) {
      console.error("Error fetching silent requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("silent-requests-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "silent_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acknowledge = async (id: string) => {
    try {
      const { error } = await supabase
        .from("silent_requests")
        .update({ status: "acknowledged" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Request acknowledged");
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "acknowledged" as const } : r))
      );
    } catch (error) {
      console.error("Error acknowledging:", error);
      toast.error("Failed to acknowledge request");
    }
  };

  const markCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from("silent_requests")
        .update({ status: "completed", resolved_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Request completed");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error completing:", error);
      toast.error("Failed to complete request");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-success animate-pulse" />
            Live Feed
            {requests.length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 && !isLoading ? (
          <EmptyState
            icon={Radio}
            title="All clear!"
            description="No pending service requests. New requests will appear here in real-time."
            className="py-12"
          />
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {requests.map((request) => {
                const config = requestConfig[request.request_type] || requestConfig.water;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card/80 p-4 shadow-premium"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={config.badgeClass}>{config.label}</Badge>
                          {request.cabin_number && (
                            <span className="text-sm font-medium text-foreground">
                              Cabin #{request.cabin_number}
                            </span>
                          )}
                          {request.status === "acknowledged" && (
                            <Badge variant="outline" className="text-xs">Acknowledged</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {request.user_name} •{" "}
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                        {request.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{request.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledge(request.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markCompleted(request.id)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Done
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
