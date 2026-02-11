import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_hours: number;
  current_hours: number;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      // Sync goal progress from actual focus session data first
      await supabase.rpc("sync_goal_progress", { p_user_id: user.id });

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data as Goal[]);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (title: string, targetHours: number, deadline?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        title,
        target_hours: targetHours,
        deadline: deadline || null,
      });

      if (error) throw error;

      toast.success("Goal created!");
      await fetchGoals();
      return true;
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
      return false;
    }
  };

  const deleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) throw error;

      await fetchGoals();
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    isLoading,
    createGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
