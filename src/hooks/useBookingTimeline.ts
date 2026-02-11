 import { useState, useEffect } from "react";
 import { supabase } from "@/lib/supabase";
 import { useAuth } from "@/contexts/AuthContext";
 
 export type BatchType = "morning" | "mid_day" | "afternoon" | "evening";
 export type BatchStatus = "available" | "booked" | "held";
 
 export interface BatchSlot {
   batchType: BatchType;
   startTime: string;
   endTime: string;
   status: BatchStatus;
   bookingId: string | null;
   userId: string | null;
   isOwnBooking: boolean;
 }
 
 export interface CabinDayAvailability {
   cabinId: string;
   date: string;
   batches: BatchSlot[];
   totalAvailable: number;
   totalBooked: number;
 }
 
 export const BATCH_CONFIG: Record<BatchType, { label: string; start: string; end: string; hours: number }> = {
   morning: { label: "Morning", start: "06:00", end: "10:00", hours: 4 },
   mid_day: { label: "Mid-Day", start: "10:00", end: "14:00", hours: 4 },
   afternoon: { label: "Afternoon", start: "14:00", end: "18:00", hours: 4 },
   evening: { label: "Evening", start: "18:00", end: "22:00", hours: 4 },
 };
 
 export const BATCH_ORDER: BatchType[] = ["morning", "mid_day", "afternoon", "evening"];
 
 export function useBookingTimeline(cabinId: string | null, date: string) {
   const [availability, setAvailability] = useState<CabinDayAvailability | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
 
   const fetchAvailability = async () => {
     if (!cabinId || !date) {
       setAvailability(null);
       return;
     }
 
     setIsLoading(true);
     try {
       const { data, error } = await supabase
         .rpc("get_cabin_availability", {
           p_cabin_id: cabinId,
           p_date: date,
         });
 
       if (error) throw error;
 
       const batches: BatchSlot[] = (data || []).map((row: any) => ({
         batchType: row.batch_type as BatchType,
         startTime: row.start_time,
         endTime: row.end_time,
         status: row.status as BatchStatus,
         bookingId: row.booking_id,
         userId: row.user_id,
         isOwnBooking: row.user_id === user?.id,
       }));
 
       const totalAvailable = batches.filter(b => b.status === "available").length;
       const totalBooked = batches.filter(b => b.status === "booked").length;
 
       setAvailability({
         cabinId,
         date,
         batches,
         totalAvailable,
         totalBooked,
       });
     } catch (error) {
       console.error("Error fetching cabin availability:", error);
       setAvailability(null);
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchAvailability();
   }, [cabinId, date, user?.id]);
 
   return {
     availability,
     isLoading,
     refetch: fetchAvailability,
   };
 }
 
 // Hook to get availability for all cabins on a date
 export function useAllCabinsTimeline(cabinIds: string[], date: string) {
   const [availabilityMap, setAvailabilityMap] = useState<Map<string, CabinDayAvailability>>(new Map());
   const [isLoading, setIsLoading] = useState(false);
   const { user } = useAuth();
 
   const fetchAll = async () => {
     if (cabinIds.length === 0 || !date) {
       setAvailabilityMap(new Map());
       return;
     }
 
     setIsLoading(true);
     try {
       const results = await Promise.all(
         cabinIds.map(async (cabinId) => {
           const { data, error } = await supabase
             .rpc("get_cabin_availability", {
               p_cabin_id: cabinId,
               p_date: date,
             });
 
           if (error) throw error;
 
           const batches: BatchSlot[] = (data || []).map((row: any) => ({
             batchType: row.batch_type as BatchType,
             startTime: row.start_time,
             endTime: row.end_time,
             status: row.status as BatchStatus,
             bookingId: row.booking_id,
             userId: row.user_id,
             isOwnBooking: row.user_id === user?.id,
           }));
 
           const totalAvailable = batches.filter(b => b.status === "available").length;
           const totalBooked = batches.filter(b => b.status === "booked").length;
 
           return {
             cabinId,
             date,
             batches,
             totalAvailable,
             totalBooked,
           };
         })
       );
 
       const newMap = new Map<string, CabinDayAvailability>();
       results.forEach((result) => {
         newMap.set(result.cabinId, result);
       });
       setAvailabilityMap(newMap);
     } catch (error) {
       console.error("Error fetching all cabin availability:", error);
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchAll();
   }, [cabinIds.join(","), date, user?.id]);
 
   return {
     availabilityMap,
     isLoading,
     refetch: fetchAll,
   };
 }