import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import confetti from "canvas-confetti";
import { SeatMap } from "@/components/booking/SeatMap";
import { BatchTimelineView } from "@/components/booking/BatchTimelineView";
import { getBatchPrice, BookingMode } from "@/components/booking/BatchSelector";
import { BookingModeToggle } from "@/components/booking/BookingModeToggle";
import { BookingHoldTimer } from "@/components/booking/BookingHoldTimer";
import { useCabins, Cabin } from "@/hooks/useCabins";
import { useAllCabinsTimeline, useBookingTimeline, BatchType, BATCH_CONFIG, BATCH_ORDER } from "@/hooks/useBookingTimeline";
import { useBookingHold } from "@/hooks/useBookingHold";
import { useAuth } from "@/contexts/AuthContext";
import { checkMonthlyConflicts } from "@/hooks/useMonthlyConflictCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight, Calendar, Check } from "lucide-react";
import { LockerAddonCard } from "@/components/booking/LockerAddonCard";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

type BookingStep = "seat" | "slot" | "confirm";

export default function Book() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cabins, isLoading: cabinsLoading } = useCabins();

  const [step, setStep] = useState<BookingStep>("seat");
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBatches, setSelectedBatches] = useState<BatchType[]>([]);
  const [bookingMode, setBookingMode] = useState<BookingMode>("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);
  const [lockerAdded, setLockerAdded] = useState(false);

  const maxDate = addDays(new Date(), 5);
  const dateString = format(selectedDate, "yyyy-MM-dd");

  // Fetch availability for all cabins on selected date
  const cabinIds = useMemo(() => cabins.map(c => c.id), [cabins]);
  const { availabilityMap, isLoading: availabilityLoading } = useAllCabinsTimeline(cabinIds, dateString);

  // Fetch detailed timeline for selected cabin
  const { availability: cabinTimeline, isLoading: timelineLoading } = useBookingTimeline(
    selectedCabin?.id || null,
    dateString
  );

  // Booking hold management
  const { 
    activeHold, 
    timeRemaining, 
    isCreating: isCreatingHold, 
    createHold, 
    releaseHold 
  } = useBookingHold();

  // Convert availability map to legacy format for SeatMap
  const cabinAvailability = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string }[]>();
    availabilityMap.forEach((availability, cabinId) => {
      const bookedSlots = availability.batches
        .filter(b => b.status === "booked" || b.status === "held")
        .map(b => ({
          startTime: b.startTime,
          endTime: b.endTime,
        }));
      map.set(cabinId, bookedSlots);
    });
    return map;
  }, [availabilityMap]);

  // Get disabled batches (already booked/held) — only for daily mode
  const disabledBatches = useMemo(() => {
    if (bookingMode === "monthly" || !cabinTimeline) return [];
    return cabinTimeline.batches
      .filter(b => b.status !== "available")
      .map(b => b.batchType);
  }, [cabinTimeline, bookingMode]);

  const handleSelectCabin = async (cabin: Cabin) => {
    if (!user) {
      toast.error("Please sign in to book a seat");
      navigate("/login");
      return;
    }
    await releaseHold();
    setSelectedCabin(cabin);
    setSelectedBatches([]);
    setStep("slot");
  };

  const handleBatchSelect = (batch: BatchType) => {
    setSelectedBatches(prev => [...prev, batch]);
  };

  const handleBatchDeselect = (batch: BatchType) => {
    setSelectedBatches(prev => prev.filter(b => b !== batch));
  };

  const handleProceedToConfirm = async () => {
    if (!selectedCabin || selectedBatches.length === 0) return;

    // For monthly bookings, run the 30-day conflict check first
    if (bookingMode === "monthly") {
      setIsCheckingConflicts(true);
      try {
        const result = await checkMonthlyConflicts(selectedCabin.id, selectedDate, selectedBatches);
        if (result.hasConflicts) {
          toast.error(
            `Seat #${selectedCabin.cabin_number} is unavailable on: ${result.conflictDates.join(", ")}. Please choose another seat.`,
            { duration: 6000 }
          );
          return;
        }
      } catch {
        toast.error("Failed to check availability. Please try again.");
        return;
      } finally {
        setIsCheckingConflicts(false);
      }
    }

    // Create a hold for the selected batches
    const success = await createHold(selectedCabin.id, dateString, selectedBatches);
    if (success) {
      setStep("confirm");
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedCabin || !user || selectedBatches.length === 0) return;
    
    setIsSubmitting(true);

    try {
      const sortedBatches = [...selectedBatches].sort(
        (a, b) => BATCH_ORDER.indexOf(a) - BATCH_ORDER.indexOf(b)
      );
      const earliestBatch = sortedBatches[0];
      const latestBatch = sortedBatches[sortedBatches.length - 1];
      
      const totalHours = selectedBatches.length * 4;
      let slotType: "four_hours" | "eight_hours" | "full_day" | "monthly" = "four_hours";
      if (bookingMode === "monthly") {
        slotType = "monthly";
      } else if (totalHours >= 12) {
        slotType = "full_day";
      } else if (totalHours >= 8) {
        slotType = "eight_hours";
      }

      // Use ISO string format for timestamps to avoid timezone issues
      const startTs = new Date(`${dateString}T${BATCH_CONFIG[earliestBatch].start}:00`);
      const endTime = BATCH_CONFIG[latestBatch].end;
      
      const endDate = bookingMode === "monthly"
        ? format(addDays(selectedDate, 30), "yyyy-MM-dd")
        : dateString;
      const endTs = new Date(`${endDate}T${endTime}:00`);
      const bufferEndTs = new Date(endTs.getTime() + 15 * 60 * 1000);

      const seatAmount = getBatchPrice(selectedBatches, bookingMode);
      const lockerAmount = lockerAdded ? 100 : 0;
      const totalAmount = seatAmount + lockerAmount;

      // Build booking rows — one per selected batch for multi-slot, 
      // ensuring each is inserted properly
      const bookingRows = sortedBatches.map((batch, idx) => {
        const batchStart = new Date(`${dateString}T${BATCH_CONFIG[batch].start}:00`);
        const batchEndDate = bookingMode === "monthly" ? endDate : dateString;
        const batchEnd = new Date(`${batchEndDate}T${BATCH_CONFIG[batch].end}:00`);
        const batchBuffer = new Date(batchEnd.getTime() + 15 * 60 * 1000);

        // Add locker cost to first batch row only
        const batchAmount = Math.round(seatAmount / sortedBatches.length) + (idx === 0 ? lockerAmount : 0);

        return {
          cabin_id: selectedCabin.id,
          user_id: user.id,
          start_timestamp: batchStart.toISOString(),
          end_timestamp: batchEnd.toISOString(),
          buffer_end_timestamp: batchBuffer.toISOString(),
          batch_type: batch,
          slot_type: slotType,
          status: "confirmed" as const,
          booking_type: bookingMode,
          amount: batchAmount,
          booking_date: dateString,
          start_time: BATCH_CONFIG[batch].start,
          end_time: BATCH_CONFIG[batch].end,
          has_locker: lockerAdded,
        };
      });

      // Release holds BEFORE inserting bookings to avoid self-overlap
      await releaseHold();

      // Batch insert all selected slots at once
      const { error } = await supabase.from("bookings").insert(bookingRows);

      if (error) {
        console.error("Supabase booking insert error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error("Booking rows sent:", JSON.stringify(bookingRows, null, 2));
        throw error;
      }

      // 🎉 Confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f0c040', '#e09030', '#d07020', '#40a060', '#3080c0'],
      });

      toast.success("🎉 Booking confirmed! Time to focus!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      if (error.message?.includes("already booked") || error.message?.includes("held")) {
        toast.error("This slot is no longer available. Please go back and select again.");
      } else if (error.code === "42501") {
        toast.error("Permission denied. Please make sure you're logged in.");
      } else {
        toast.error(`Booking failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await releaseHold();
    setSelectedCabin(null);
    setSelectedBatches([]);
    setStep("seat");
  };

  const handleModeChange = (mode: BookingMode) => {
    setBookingMode(mode);
    setSelectedBatches([]);
  };

  const canProceedToConfirm = selectedBatches.length > 0;
  const totalPrice = getBatchPrice(selectedBatches, bookingMode) + (lockerAdded ? 100 : 0);

  return (
    <div className="container py-6 sm:py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2">
          {["seat", "slot", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["seat", "slot", "confirm"].indexOf(step) > i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 ${
                    ["seat", "slot", "confirm"].indexOf(step) > i
                      ? "bg-primary/50"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-8 text-xs text-muted-foreground sm:gap-16">
          <span>Select Seat</span>
          <span>Choose Slot</span>
          <span>Confirm</span>
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-4xl">
        {step === "seat" && (
          <div className="animate-fade-up space-y-6">
            {/* Booking Mode Toggle */}
            <BookingModeToggle mode={bookingMode} onModeChange={handleModeChange} />

            {/* Date selector on seat selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {bookingMode === "monthly" ? "Select Start Date" : "Select Date"}
                </CardTitle>
                {bookingMode === "monthly" && (
                  <p className="text-sm text-muted-foreground">
                    Covers {format(selectedDate, "MMM d")} → {format(addDays(selectedDate, 30), "MMM d, yyyy")}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  disabled={(date) => {
                    const today = new Date(new Date().setHours(0, 0, 0, 0));
                    if (date < today) return true;
                    if (bookingMode === "daily" && date > maxDate) return true;
                    return false;
                  }}
                  className="rounded-md border pointer-events-auto"
                />
              </CardContent>
            </Card>
            
            <SeatMap
              cabins={cabins}
              isLoading={cabinsLoading || availabilityLoading}
              selectedCabin={selectedCabin}
              onSelectCabin={handleSelectCabin}
              cabinAvailability={cabinAvailability}
            />
          </div>
        )}

        {step === "slot" && selectedCabin && (
          <div className="animate-fade-up space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep("seat")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Seat
              </Button>
              <Badge variant="outline">
                {bookingMode === "monthly" ? "Monthly Pass" : "Daily Booking"}
              </Badge>
            </div>

            {/* Timeline view for selected seat */}
            <BatchTimelineView
              cabinNumber={selectedCabin.cabin_number}
              date={dateString}
              availability={cabinTimeline}
              isLoading={timelineLoading}
              selectedBatches={selectedBatches}
              onBatchSelect={handleBatchSelect}
              onBatchDeselect={handleBatchDeselect}
              bookingMode={bookingMode}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleProceedToConfirm}
                disabled={!canProceedToConfirm || isCreatingHold || isCheckingConflicts}
                className="group"
              >
                {isCheckingConflicts
                  ? "Checking availability..."
                  : isCreatingHold
                  ? "Reserving..."
                  : `Reserve for ₹${totalPrice}${bookingMode === "monthly" ? "/mo" : ""}`}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        )}

        {step === "confirm" && selectedCabin && activeHold && (
          <div className="animate-fade-up">
            <Button
              variant="ghost"
              onClick={() => {
                releaseHold();
                setStep("slot");
              }}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="space-y-6">
              {/* Hold timer */}
              <BookingHoldTimer
                timeRemaining={timeRemaining}
                cabinNumber={selectedCabin.cabin_number}
              />

              {/* Locker add-on */}
              <LockerAddonCard isAdded={lockerAdded} onToggle={setLockerAdded} />

              {/* Booking summary card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Confirm Your Booking
                    <Badge variant={bookingMode === "monthly" ? "default" : "secondary"}>
                      {bookingMode === "monthly" ? "Monthly (30 Days)" : "Daily"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Seat</p>
                      <p className="font-semibold">#{selectedCabin.cabin_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {bookingMode === "monthly" ? "Date Range" : "Date"}
                      </p>
                      <p className="font-semibold">
                        {bookingMode === "monthly"
                          ? `${format(selectedDate, "MMM d")} → ${format(addDays(selectedDate, 30), "MMM d, yyyy")}`
                          : format(selectedDate, "EEE, MMM d")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{selectedBatches.length * 4} hours/day</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold">
                        {selectedBatches.length > 0 && (
                          <>
                            {BATCH_CONFIG[selectedBatches.sort((a, b) => 
                              BATCH_ORDER.indexOf(a) - BATCH_ORDER.indexOf(b)
                            )[0]].start.replace(":00", "")} - {
                              BATCH_CONFIG[selectedBatches.sort((a, b) => 
                                BATCH_ORDER.indexOf(a) - BATCH_ORDER.indexOf(b)
                              )[selectedBatches.length - 1]].end.replace(":00", "")
                            }
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground">Total</span>
                        {bookingMode === "monthly" && (
                          <p className="text-xs text-muted-foreground">
                            {selectedBatches.length} slot{selectedBatches.length > 1 ? "s" : ""} × ₹300/mo
                          </p>
                        )}
                      </div>
                      <span className="text-2xl font-bold">₹{totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel} 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmBooking} 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Confirming..." : "Confirm Booking"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
