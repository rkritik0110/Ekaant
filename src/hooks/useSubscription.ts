import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Subscription {
  id: string;
  user_id: string;
  hours_remaining: number;
  hours_total: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString().split("T")[0])
        .order("valid_until", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setSubscription(data as Subscription | null);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const deductHours = async (hours: number): Promise<boolean> => {
    if (!subscription || subscription.hours_remaining < hours) {
      toast.error("Insufficient hours remaining");
      return false;
    }

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          hours_remaining: subscription.hours_remaining - hours,
        })
        .eq("id", subscription.id);

      if (error) throw error;

      await fetchSubscription();
      return true;
    } catch (error) {
      console.error("Error deducting hours:", error);
      toast.error("Failed to deduct hours");
      return false;
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const hoursUsed = subscription
    ? subscription.hours_total - subscription.hours_remaining
    : 0;

  const percentageUsed = subscription
    ? Math.round((hoursUsed / subscription.hours_total) * 100)
    : 0;

  return {
    subscription,
    isLoading,
    hoursUsed,
    percentageUsed,
    deductHours,
    refetch: fetchSubscription,
  };
}
