import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type RequestType = "water" | "coffee" | "noise_complaint" | "assistance";
export type RequestStatus = "pending" | "acknowledged" | "completed";

export interface SilentRequest {
  id: string;
  user_id: string;
  cabin_id: string | null;
  request_type: RequestType;
  status: RequestStatus;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export function useSilentRequests() {
  const [requests, setRequests] = useState<SilentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role } = useAuth();

  const fetchRequests = async () => {
    if (!user) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("silent_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRequests(data as SilentRequest[]);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (
    requestType: RequestType,
    cabinId?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to make a request");
      return false;
    }

    try {
      const { error } = await supabase.from("silent_requests").insert({
        user_id: user.id,
        cabin_id: cabinId || null,
        request_type: requestType,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Request sent!");
      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to send request");
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: RequestStatus
  ): Promise<boolean> => {
    if (role !== "admin") {
      toast.error("Only admins can update requests");
      return false;
    }

    try {
      const updateData: Record<string, unknown> = { status };
      if (status === "completed") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("silent_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request");
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();

    if (user) {
      const channel = supabase
        .channel("silent-requests-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "silent_requests",
          },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    requests,
    isLoading,
    createRequest,
    updateRequestStatus,
    refetch: fetchRequests,
  };
}
