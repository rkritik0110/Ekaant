 import { useState, useEffect } from "react";
 import { supabase } from "@/lib/supabase";
 
 export interface CabinBooking {
   id: string;
   cabin_id: string;
   start_time: string;
   end_time: string;
   booking_date: string;
   status: string;
 }
 
 // Clean time strings to remove timezone suffix
 function cleanTime(time: string): string {
   const plusIndex = time.indexOf('+');
   if (plusIndex > 0) return time.slice(0, plusIndex);
   return time.split('-')[0] || time;
 }
 
 export function useCabinBookings(cabinId: string | null, date: string | null) {
   const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
   const [isLoading, setIsLoading] = useState(false);
 
   useEffect(() => {
     async function fetchBookings() {
       if (!cabinId || !date) {
         setBookedSlots([]);
         return;
       }
 
       setIsLoading(true);
       try {
         const { data, error } = await supabase
           .from("bookings")
           .select("start_time, end_time")
           .eq("cabin_id", cabinId)
           .eq("booking_date", date)
           .eq("status", "confirmed");
 
         if (error) throw error;
 
         const slots = (data || []).map((b) => ({
           startTime: cleanTime(b.start_time).slice(0, 5),
           endTime: cleanTime(b.end_time).slice(0, 5),
         }));
 
         setBookedSlots(slots);
       } catch (error) {
         console.error("Error fetching cabin bookings:", error);
       } finally {
         setIsLoading(false);
       }
     }
 
     fetchBookings();
   }, [cabinId, date]);
 
   return { bookedSlots, isLoading };
 }
 
 // Fetch all cabin availability for a specific date
 export function useAllCabinBookings(date: string | null) {
   const [cabinAvailability, setCabinAvailability] = useState<Map<string, { startTime: string; endTime: string }[]>>(new Map());
   const [isLoading, setIsLoading] = useState(false);
 
   useEffect(() => {
     async function fetchAllBookings() {
       if (!date) {
         setCabinAvailability(new Map());
         return;
       }
 
       setIsLoading(true);
       try {
         const { data, error } = await supabase
           .from("bookings")
           .select("cabin_id, start_time, end_time")
           .eq("booking_date", date)
           .eq("status", "confirmed");
 
         if (error) throw error;
 
         const availabilityMap = new Map<string, { startTime: string; endTime: string }[]>();
         
         (data || []).forEach((booking) => {
           const cabinId = booking.cabin_id;
           const slot = {
             startTime: cleanTime(booking.start_time).slice(0, 5),
             endTime: cleanTime(booking.end_time).slice(0, 5),
           };
 
           if (!availabilityMap.has(cabinId)) {
             availabilityMap.set(cabinId, []);
           }
           availabilityMap.get(cabinId)!.push(slot);
         });
 
         setCabinAvailability(availabilityMap);
       } catch (error) {
         console.error("Error fetching all bookings:", error);
       } finally {
         setIsLoading(false);
       }
     }
 
     fetchAllBookings();
   }, [date]);
 
   return { cabinAvailability, isLoading };
 }