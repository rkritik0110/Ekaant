import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface AdminStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  pendingRequests: number;
  totalUsers: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0,
    pendingRequests: 0,
    totalUsers: 0,
  });
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useAuth();

  const fetchStats = async () => {
    if (role !== "admin") {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*");

      const today = new Date().toISOString().split("T")[0];
      const activeBookings = bookings?.filter((b) => b.status === "confirmed") || [];
      const todayBookings = bookings?.filter((b) => b.booking_date === today) || [];

      // Calculate revenue from actual booking amounts
      const totalRevenue = bookings?.reduce((sum, b) => {
        return sum + (b.amount || 0);
      }, 0) || 0;

      const todayRevenue = todayBookings.reduce((sum, b) => {
        return sum + (b.amount || 0);
      }, 0);

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("is_active", true);

      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      const expiringSubscriptions = subscriptions?.filter((s) => {
        const validUntil = new Date(s.valid_until);
        return validUntil <= twoDaysFromNow;
      }) || [];

      // Fetch pending requests
      const { data: requests } = await supabase
        .from("silent_requests")
        .select("*")
        .eq("status", "pending");

      // Fetch user count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setStats({
        totalBookings: bookings?.length || 0,
        activeBookings: activeBookings.length,
        totalRevenue,
        todayRevenue,
        activeSubscriptions: subscriptions?.length || 0,
        expiringSubscriptions: expiringSubscriptions.length,
        pendingRequests: requests?.length || 0,
        totalUsers: userCount || 0,
      });

      // Calculate daily revenue for the last 7 days
      const last7Days: DailyRevenue[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayBookings = bookings?.filter((b) => b.booking_date === dateStr) || [];
        const revenue = dayBookings.reduce((sum, b) => {
          return sum + (b.amount || 0);
        }, 0);
        last7Days.push({ date: dateStr, revenue });
      }
      setDailyRevenue(last7Days);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  return {
    stats,
    dailyRevenue,
    isLoading,
    refetch: fetchStats,
  };
}
