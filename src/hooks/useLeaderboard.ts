import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  is_anonymous: boolean;
  total_minutes: number;
  rank: number;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc("get_weekly_leaderboard");

      if (error) throw error;
      setEntries(data as LeaderboardEntry[]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Refresh every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    entries,
    isLoading,
    refetch: fetchLeaderboard,
  };
}
