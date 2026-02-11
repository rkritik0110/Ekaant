import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CabinStatus = "available" | "occupied" | "on_hold";

export interface Cabin {
  id: string;
  cabin_number: number;
  status: CabinStatus;
  held_by: string | null;
  held_until: string | null;
}

export function useCabins() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCabins = async () => {
    try {
      const { data, error } = await supabase
        .from("cabins")
        .select("*")
        .order("cabin_number");

      if (error) throw error;

      // Check and release expired holds
      const now = new Date();
      const updatedCabins = (data || []).map((cabin) => {
        if (
          cabin.status === "on_hold" &&
          cabin.held_until &&
          new Date(cabin.held_until) < now
        ) {
          return { ...cabin, status: "available" as CabinStatus, held_by: null, held_until: null };
        }
        return cabin as Cabin;
      });

      setCabins(updatedCabins);
    } catch (error) {
      console.error("Error fetching cabins:", error);
      toast.error("Failed to load cabins");
    } finally {
      setIsLoading(false);
    }
  };

  const holdCabin = async (cabinId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to book a seat");
      return false;
    }

    try {
      const heldUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("cabins")
        .update({
          status: "on_hold",
          held_by: user.id,
          held_until: heldUntil,
        })
        .eq("id", cabinId)
        .eq("status", "available");

      if (error) throw error;

      toast.success("Seat held for 15 minutes");
      await fetchCabins();
      return true;
    } catch (error) {
      console.error("Error holding cabin:", error);
      toast.error("Failed to hold seat");
      return false;
    }
  };

  const releaseCabin = async (cabinId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("cabins")
        .update({
          status: "available",
          held_by: null,
          held_until: null,
        })
        .eq("id", cabinId);

      if (error) throw error;

      await fetchCabins();
      return true;
    } catch (error) {
      console.error("Error releasing cabin:", error);
      toast.error("Failed to release seat");
      return false;
    }
  };

  const confirmBooking = async (cabinId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("cabins")
        .update({
          status: "occupied",
          held_until: null,
        })
        .eq("id", cabinId);

      if (error) throw error;

      await fetchCabins();
      return true;
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
      return false;
    }
  };

  useEffect(() => {
    fetchCabins();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("cabins-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cabins",
        },
        () => {
          fetchCabins();
        }
      )
      .subscribe();

    // Check for expired holds every minute
    const interval = setInterval(fetchCabins, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    cabins,
    isLoading,
    holdCabin,
    releaseCabin,
    confirmBooking,
    refetch: fetchCabins,
  };
}
