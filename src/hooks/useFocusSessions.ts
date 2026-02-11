import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FocusSession {
  id: string;
  user_id: string;
  cabin_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  is_active: boolean;
}

export interface FocusStats {
  today_minutes: number;
  week_minutes: number;
  month_minutes: number;
  total_minutes: number;
}

export function useFocusSessions() {
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [stats, setStats] = useState<FocusStats>({
    today_minutes: 0,
    week_minutes: 0,
    month_minutes: 0,
    total_minutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchActiveSession = async () => {
    if (!user) {
      setActiveSession(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      setActiveSession(data as FocusSession | null);
    } catch (error) {
      console.error("Error fetching active session:", error);
    }
  };

  const fetchStats = async () => {
    if (!user) {
      setStats({ today_minutes: 0, week_minutes: 0, month_minutes: 0, total_minutes: 0 });
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_user_focus_stats", {
        p_user_id: user.id,
      });

      if (error) throw error;
      if (data && data[0]) {
        setStats(data[0] as FocusStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const startSession = async (cabinId?: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to start a focus session");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: user.id,
          cabin_id: cabinId || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data as FocusSession);
      toast.success("Focus session started!");
      return true;
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Failed to start session");
      return false;
    }
  };

  const endSession = async (): Promise<number> => {
    if (!activeSession) return 0;

    try {
      const startedAt = new Date(activeSession.started_at);
      const endedAt = new Date();
      const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

      const { error } = await supabase
        .from("focus_sessions")
        .update({
          ended_at: endedAt.toISOString(),
          duration_minutes: durationMinutes,
          is_active: false,
        })
        .eq("id", activeSession.id);

      if (error) throw error;

      setActiveSession(null);
      await fetchStats();
      toast.success(`Session ended! You focused for ${durationMinutes} minutes.`);
      return durationMinutes;
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Failed to end session");
      return 0;
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchActiveSession(), fetchStats()]);
      setIsLoading(false);
    };
    load();
  }, [user]);

  return {
    activeSession,
    stats,
    isLoading,
    startSession,
    endSession,
    refetch: () => Promise.all([fetchActiveSession(), fetchStats()]),
  };
}
