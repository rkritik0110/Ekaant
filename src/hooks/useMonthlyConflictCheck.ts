import { supabase } from "@/lib/supabase";
import { BatchType, BATCH_CONFIG } from "./useBookingTimeline";
import { format, addDays } from "date-fns";

export interface ConflictResult {
  hasConflicts: boolean;
  conflictDates: string[]; // formatted date strings
}

/**
 * Checks if a monthly booking (30 days) for the given cabin + batches
 * has any conflicting bookings on any day in the range.
 */
export async function checkMonthlyConflicts(
  cabinId: string,
  startDate: Date,
  batches: BatchType[]
): Promise<ConflictResult> {
  if (batches.length === 0) {
    return { hasConflicts: false, conflictDates: [] };
  }

  // Get earliest start time and latest end time from selected batches
  const sortedBatches = [...batches].sort(
    (a, b) => BATCH_CONFIG[a].start.localeCompare(BATCH_CONFIG[b].start)
  );
  const earliestStart = BATCH_CONFIG[sortedBatches[0]].start;
  const latestEnd = BATCH_CONFIG[sortedBatches[sortedBatches.length - 1]].end;

  // Build the full 30-day range timestamps
  const rangeStart = `${format(startDate, "yyyy-MM-dd")}T${earliestStart}:00`;
  const rangeEnd = `${format(addDays(startDate, 30), "yyyy-MM-dd")}T${latestEnd}:00`;

  // Query all bookings that overlap with ANY day in this 30-day range
  const { data, error } = await supabase
    .from("bookings")
    .select("id, start_timestamp, end_timestamp, booking_date")
    .eq("cabin_id", cabinId)
    .in("status", ["confirmed", "held", "pending"])
    .lt("start_timestamp", rangeEnd)
    .gt("end_timestamp", rangeStart);

  if (error) {
    console.error("Error checking monthly conflicts:", error);
    throw new Error("Failed to check availability");
  }

  if (!data || data.length === 0) {
    return { hasConflicts: false, conflictDates: [] };
  }

  // For each day in the 30-day range, check if any existing booking
  // overlaps with the requested time slot
  const conflictDates: string[] = [];

  for (let i = 0; i < 30; i++) {
    const dayDate = addDays(startDate, i);
    const dayStr = format(dayDate, "yyyy-MM-dd");
    const dayStart = new Date(`${dayStr}T${earliestStart}:00`);
    const dayEnd = new Date(`${dayStr}T${latestEnd}:00`);

    const hasConflict = data.some((booking) => {
      const bookingStart = new Date(booking.start_timestamp!);
      const bookingEnd = new Date(booking.end_timestamp!);
      // Overlap check: existing.start < day.end AND existing.end > day.start
      return bookingStart < dayEnd && bookingEnd > dayStart;
    });

    if (hasConflict) {
      conflictDates.push(format(dayDate, "MMM d"));
    }
  }

  return {
    hasConflicts: conflictDates.length > 0,
    conflictDates,
  };
}
