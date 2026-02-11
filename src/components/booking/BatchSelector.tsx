import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, Sparkles } from "lucide-react";
import { BatchType, BATCH_CONFIG, BATCH_ORDER } from "@/hooks/useBookingTimeline";

// Pricing constants
export const DAILY_PRICE_PER_BATCH = 15;   // INR per 4-hour slot, single day
export const MONTHLY_PRICE_PER_BATCH = 300; // INR per 4-hour slot, 30 days

export type BookingMode = "daily" | "monthly";

interface BatchSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedBatches: BatchType[];
  onBatchesChange: (batches: BatchType[]) => void;
  disabledBatches?: BatchType[];
  bookingMode: BookingMode;
}

export function BatchSelector({
  selectedDate,
  onDateChange,
  selectedBatches,
  onBatchesChange,
  disabledBatches = [],
  bookingMode,
}: BatchSelectorProps) {
  const isMonthly = bookingMode === "monthly";
  const maxDate = isMonthly ? undefined : addDays(new Date(), 5);
  const pricePerBatch = isMonthly ? MONTHLY_PRICE_PER_BATCH : DAILY_PRICE_PER_BATCH;
  const totalPrice = getBatchPrice(selectedBatches, bookingMode);

  const toggleBatch = (batch: BatchType) => {
    if (disabledBatches.includes(batch)) return;
    
    if (selectedBatches.includes(batch)) {
      onBatchesChange(selectedBatches.filter(b => b !== batch));
    } else {
      onBatchesChange([...selectedBatches, batch]);
    }
  };

  const selectPreset = (preset: "morning" | "afternoon" | "fullDay") => {
    let batches: BatchType[] = [];
    switch (preset) {
      case "morning":
        batches = ["morning", "mid_day"];
        break;
      case "afternoon":
        batches = ["afternoon", "evening"];
        break;
      case "fullDay":
        batches = ["morning", "mid_day", "afternoon", "evening"];
        break;
    }
    batches = batches.filter(b => !disabledBatches.includes(b));
    onBatchesChange(batches);
  };

  const getRecommendedBatches = (): BatchType[] => {
    if (selectedBatches.length === 0) return [];
    
    const recommended: BatchType[] = [];
    const selectedIndices = selectedBatches.map(b => BATCH_ORDER.indexOf(b));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);
    
    if (minIndex > 0 && !selectedBatches.includes(BATCH_ORDER[minIndex - 1]) && !disabledBatches.includes(BATCH_ORDER[minIndex - 1])) {
      recommended.push(BATCH_ORDER[minIndex - 1]);
    }
    if (maxIndex < BATCH_ORDER.length - 1 && !selectedBatches.includes(BATCH_ORDER[maxIndex + 1]) && !disabledBatches.includes(BATCH_ORDER[maxIndex + 1])) {
      recommended.push(BATCH_ORDER[maxIndex + 1]);
    }
    
    return recommended;
  };

  const recommendedBatches = getRecommendedBatches();

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {isMonthly ? "Select Start Date" : "Select Date"}
            {!isMonthly && (
              <Badge variant="outline" className="ml-auto text-xs">
                Max 5 days ahead
              </Badge>
            )}
          </CardTitle>
          {isMonthly && (
            <p className="text-sm text-muted-foreground">
              Your booking will cover 30 days from this date
              {selectedDate && (
                <span className="font-medium block mt-1">
                  {format(selectedDate, "MMM d")} → {format(addDays(selectedDate, 30), "MMM d, yyyy")}
                </span>
              )}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && onDateChange(d)}
            disabled={(date) => {
              const today = new Date(new Date().setHours(0, 0, 0, 0));
              if (date < today) return true;
              if (!isMonthly && maxDate && date > maxDate) return true;
              return false;
            }}
            className="rounded-md border pointer-events-auto"
          />
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Select
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => selectPreset("morning")}
            >
              <span className="text-sm font-medium">Morning Block</span>
              <span className="text-xs text-muted-foreground">6 AM - 2 PM</span>
              <Badge className="mt-1" variant="secondary">
                ₹{pricePerBatch * 2}{isMonthly ? "/mo" : ""}
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => selectPreset("afternoon")}
            >
              <span className="text-sm font-medium">Afternoon Block</span>
              <span className="text-xs text-muted-foreground">2 PM - 10 PM</span>
              <Badge className="mt-1" variant="secondary">
                ₹{pricePerBatch * 2}{isMonthly ? "/mo" : ""}
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 gap-1 border-primary/50"
              onClick={() => selectPreset("fullDay")}
            >
              <span className="text-sm font-medium">Full Day</span>
              <span className="text-xs text-muted-foreground">6 AM - 10 PM</span>
              <Badge className="mt-1 bg-primary text-primary-foreground">
                ₹{pricePerBatch * 4}{isMonthly ? "/mo" : ""}
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Batch Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Select Time Batches
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isMonthly
              ? "Select batches for your monthly pass. ₹300/slot for 30 days."
              : "₹15 per 4-hour slot. Select one or more."}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BATCH_ORDER.map((batchType) => {
              const config = BATCH_CONFIG[batchType];
              const isSelected = selectedBatches.includes(batchType);
              const isDisabled = disabledBatches.includes(batchType);
              const isRecommended = recommendedBatches.includes(batchType);

              return (
                <button
                  key={batchType}
                  onClick={() => toggleBatch(batchType)}
                  disabled={isDisabled}
                  className={cn(
                    "relative flex flex-col items-center rounded-xl border-2 p-4 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2" 
                      : "border-border hover:border-primary/50",
                    isDisabled && "opacity-50 cursor-not-allowed bg-muted",
                    !isDisabled && "cursor-pointer hover:scale-[1.02]"
                  )}
                >
                  {isRecommended && !isDisabled && (
                    <Badge 
                      className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-accent text-accent-foreground"
                    >
                      +Add
                    </Badge>
                  )}
                  
                  <span className="text-sm font-medium">{config.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {config.start.replace(":00", "")} - {config.end.replace(":00", "")}
                  </span>
                  <span className="text-xs font-medium mt-2">
                    {isDisabled ? "Unavailable" : `₹${pricePerBatch}${isMonthly ? "/mo" : ""}`}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {selectedBatches.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedBatches.length} batch{selectedBatches.length > 1 ? "es" : ""} × ₹{pricePerBatch}{isMonthly ? "/mo" : "/day"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold">₹{totalPrice}</span>
                  {isMonthly && (
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      30 days
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {isMonthly ? (
                  <>
                    <p>{format(selectedDate, "MMM d")} → {format(addDays(selectedDate, 30), "MMM d")}</p>
                    <p className="font-medium text-xs">₹{Math.round(totalPrice / 30)}/day effective</p>
                  </>
                ) : (
                  <p>{format(selectedDate, "EEE, MMM d")}</p>
                )}
                <p className="font-medium">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getBatchPrice(batches: BatchType[], mode: BookingMode = "daily"): number {
  if (batches.length === 0) return 0;
  const pricePerBatch = mode === "monthly" ? MONTHLY_PRICE_PER_BATCH : DAILY_PRICE_PER_BATCH;
  return batches.length * pricePerBatch;
}
