 import { useState, useEffect, useCallback, useRef } from "react";
 import { supabase } from "@/lib/supabase";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";
 import { BatchType, BATCH_CONFIG } from "./useBookingTimeline";
 
 export interface BookingHold {
   id: string;
   cabinId: string;
   startTimestamp: string;
   endTimestamp: string;
   heldUntil: string;
 }
 
 export function useBookingHold() {
    const [activeHold, setActiveHold] = useState<BookingHold | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isCreating, setIsCreating] = useState(false);
    const holdIdsRef = useRef<string[]>([]);
    const { user } = useAuth();
 
   // Create a hold for selected batches
    const createHold = async (
      cabinId: string,
      date: string,
      batches: BatchType[]
    ): Promise<boolean> => {
      if (!user || batches.length === 0) return false;

      setIsCreating(true);
      try {
        // Create separate holds for each batch to avoid false overlaps
        // when selecting non-contiguous batches (e.g. morning + evening)
        const holdRows = batches.map((batch) => {
          const startTimestamp = `${date}T${BATCH_CONFIG[batch].start}:00`;
          const endTimestamp = `${date}T${BATCH_CONFIG[batch].end}:00`;
          const bufferEndTimestamp = new Date(
            new Date(`${date}T${BATCH_CONFIG[batch].end}:00`).getTime() + 15 * 60 * 1000
          ).toISOString();

          return {
            cabin_id: cabinId,
            user_id: user.id,
            start_timestamp: startTimestamp,
            end_timestamp: endTimestamp,
            buffer_end_timestamp: bufferEndTimestamp,
          };
        });

        const { data, error } = await supabase
          .from("booking_holds")
          .insert(holdRows)
          .select();

        if (error) {
          if (error.message.includes("already booked") || error.message.includes("held")) {
            toast.error("This slot is no longer available");
          } else {
            toast.error("Failed to reserve slot");
          }
          return false;
        }

        // Store the first hold as the active hold for timer purposes
        const firstHold = data[0];
        setActiveHold({
          id: firstHold.id,
          cabinId: firstHold.cabin_id,
          startTimestamp: firstHold.start_timestamp,
          endTimestamp: firstHold.end_timestamp,
          heldUntil: firstHold.held_until,
        });

        // Store all hold IDs for cleanup
        holdIdsRef.current = data.map((h: any) => h.id);

        toast.success("Slot reserved for 15 minutes");
        return true;
      } catch (error) {
        console.error("Error creating hold:", error);
        toast.error("Failed to reserve slot");
        return false;
      } finally {
        setIsCreating(false);
      }
    };
 
   // Release all active holds
   const releaseHold = useCallback(async (): Promise<boolean> => {
     if (holdIdsRef.current.length === 0 && !activeHold) return true;

     try {
       const idsToDelete = holdIdsRef.current.length > 0 
         ? holdIdsRef.current 
         : (activeHold ? [activeHold.id] : []);
       
       if (idsToDelete.length > 0) {
         const { error } = await supabase
           .from("booking_holds")
           .delete()
           .in("id", idsToDelete);
         if (error) throw error;
       }

       setActiveHold(null);
       setTimeRemaining(0);
       holdIdsRef.current = [];
       return true;
     } catch (error) {
       console.error("Error releasing hold:", error);
       return false;
     }
   }, [activeHold]);
 
   // Convert hold to confirmed booking
   const confirmHold = async (batchType: BatchType): Promise<string | null> => {
     if (!activeHold || !user) return null;
 
     try {
       // Create the booking with the new timestamp fields
       const { data, error } = await supabase
         .from("bookings")
         .insert({
           cabin_id: activeHold.cabinId,
           user_id: user.id,
           start_timestamp: activeHold.startTimestamp,
           end_timestamp: activeHold.endTimestamp,
           buffer_end_timestamp: new Date(
             new Date(activeHold.endTimestamp).getTime() + 15 * 60 * 1000
           ).toISOString(),
           batch_type: batchType,
           slot_type: "four_hours",
           status: "confirmed",
           // Legacy fields for compatibility
           booking_date: activeHold.startTimestamp.split("T")[0],
           start_time: activeHold.startTimestamp.split("T")[1].slice(0, 5),
           end_time: activeHold.endTimestamp.split("T")[1].slice(0, 5),
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Delete the hold
       await supabase.from("booking_holds").delete().eq("id", activeHold.id);
 
       setActiveHold(null);
       setTimeRemaining(0);
       
       return data.id;
     } catch (error) {
       console.error("Error confirming hold:", error);
       toast.error("Failed to confirm booking");
       return null;
     }
   };
 
   // Timer countdown
   useEffect(() => {
     if (!activeHold?.heldUntil) {
       setTimeRemaining(0);
       return;
     }
 
     const updateTimer = () => {
       const remaining = Math.max(
         0,
         Math.floor(
           (new Date(activeHold.heldUntil).getTime() - Date.now()) / 1000
         )
       );
       setTimeRemaining(remaining);
 
       if (remaining === 0) {
         toast.error("Hold expired. Please select again.");
         setActiveHold(null);
       }
     };
 
     updateTimer();
     const interval = setInterval(updateTimer, 1000);
     return () => clearInterval(interval);
   }, [activeHold?.heldUntil]);
 
   // Cleanup on unmount
   useEffect(() => {
     return () => {
       if (holdIdsRef.current.length > 0) {
         supabase.from("booking_holds").delete().in("id", holdIdsRef.current);
       } else if (activeHold) {
         supabase.from("booking_holds").delete().eq("id", activeHold.id);
       }
     };
   }, [activeHold?.id]);
 
   return {
     activeHold,
     timeRemaining,
     isCreating,
     createHold,
     releaseHold,
     confirmHold,
   };
 }