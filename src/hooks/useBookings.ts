import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SlotType = "four_hours" | "eight_hours" | "full_day" | "monthly";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  user_id: string;
  cabin_id: string;
  slot_type: SlotType;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  amount?: number;
  has_locker?: boolean;
  cabin?: {
    cabin_number: number;
  };
}

export interface CreateBookingData {
  cabin_id: string;
  slot_type: SlotType;
  booking_date: string;
  start_time: string;
  end_time: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      setActiveBooking(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          cabin:cabins(cabin_number)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bookingsData = (data || []) as unknown as Booking[];
      setBookings(bookingsData);

       // Active booking is now computed in the Dashboard from all bookings
       setActiveBooking(null);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (data: CreateBookingData): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to book");
      return false;
    }

    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        cabin_id: data.cabin_id,
        slot_type: data.slot_type,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time: data.end_time,
        status: "confirmed",
      });

      if (error) throw error;

      toast.success("Booking confirmed!");
      await fetchBookings();
      return true;
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
      return false;
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Booking cancelled");
      await fetchBookings();
      return true;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
      return false;
    }
  };

  useEffect(() => {
    fetchBookings();

    if (user) {
      // Subscribe to realtime changes
      const channel = supabase
        .channel("bookings-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    bookings,
    activeBooking,
    isLoading,
    createBooking,
    cancelBooking,
    refetch: fetchBookings,
  };
}
