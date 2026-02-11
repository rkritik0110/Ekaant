import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Plus, X, AlertCircle } from "lucide-react";

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface TimeBlockSelectorProps {
  selectedBlocks: TimeBlock[];
  onBlocksChange: (blocks: TimeBlock[]) => void;
  bookedSlots?: { startTime: string; endTime: string }[];
}

// Available time slots from 6am to 10pm
const ALL_TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00"
];

// Predefined packages
const PACKAGES = [
  { label: "Morning (6am-10am)", start: "06:00", end: "10:00", hours: 4 },
  { label: "Afternoon (12pm-4pm)", start: "12:00", end: "16:00", hours: 4 },
  { label: "Evening (6pm-10pm)", start: "18:00", end: "22:00", hours: 4 },
  { label: "Full Day (6am-6pm)", start: "06:00", end: "18:00", hours: 12 },
];

export function TimeBlockSelector({
  selectedBlocks,
  onBlocksChange,
  bookedSlots = [],
}: TimeBlockSelectorProps) {
  const [selectingStart, setSelectingStart] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const totalHours = selectedBlocks.reduce((sum, b) => sum + b.hours, 0);

  const isTimeBooked = (time: string) => {
    return bookedSlots.some((slot) => {
      const slotStart = parseInt(slot.startTime.split(":")[0]);
      const slotEnd = parseInt(slot.endTime.split(":")[0]);
      const timeHour = parseInt(time.split(":")[0]);
      return timeHour >= slotStart && timeHour < slotEnd;
    });
  };

  const isTimeInSelectedBlock = (time: string) => {
    return selectedBlocks.some((block) => {
      const blockStart = parseInt(block.startTime.split(":")[0]);
      const blockEnd = parseInt(block.endTime.split(":")[0]);
      const timeHour = parseInt(time.split(":")[0]);
      return timeHour >= blockStart && timeHour < blockEnd;
    });
  };

  const handleTimeClick = (time: string) => {
    setError("");
    
    if (isTimeBooked(time) || isTimeInSelectedBlock(time)) {
      return;
    }

    if (!selectingStart) {
      // Start selecting a new block
      setSelectingStart(time);
    } else {
      // Complete the block selection
      const startHour = parseInt(selectingStart.split(":")[0]);
      const endHour = parseInt(time.split(":")[0]);
      
      let actualStart = selectingStart;
      let actualEnd = time;
      let hours = 0;
      
      if (endHour <= startHour) {
        // User clicked on an earlier time - swap them
        actualStart = time;
        actualEnd = selectingStart;
        hours = startHour - endHour;
      } else {
        hours = endHour - startHour;
      }

      // Minimum 4 hours
      if (hours < 4) {
        setError("Minimum 4 hours required per block");
        setSelectingStart(null);
        return;
      }

      // Check for overlaps with existing blocks
      const newStartHour = parseInt(actualStart.split(":")[0]);
      const newEndHour = parseInt(actualEnd.split(":")[0]);
      
      const hasOverlap = selectedBlocks.some((block) => {
        const blockStart = parseInt(block.startTime.split(":")[0]);
        const blockEnd = parseInt(block.endTime.split(":")[0]);
        return (newStartHour < blockEnd && newEndHour > blockStart);
      });

      if (hasOverlap) {
        setError("Time blocks cannot overlap");
        setSelectingStart(null);
        return;
      }

      const newBlock: TimeBlock = {
        id: `${actualStart}-${actualEnd}`,
        startTime: actualStart,
        endTime: actualEnd,
        hours,
      };

      onBlocksChange([...selectedBlocks, newBlock]);
      setSelectingStart(null);
    }
  };

  const handlePackageSelect = (pkg: typeof PACKAGES[0]) => {
    setError("");
    
    // Check if this package overlaps with existing blocks
    const pkgStart = parseInt(pkg.start.split(":")[0]);
    const pkgEnd = parseInt(pkg.end.split(":")[0]);
    
    const hasOverlap = selectedBlocks.some((block) => {
      const blockStart = parseInt(block.startTime.split(":")[0]);
      const blockEnd = parseInt(block.endTime.split(":")[0]);
      return (pkgStart < blockEnd && pkgEnd > blockStart);
    });

    if (hasOverlap) {
      setError("This package overlaps with an existing block");
      return;
    }

    const newBlock: TimeBlock = {
      id: `${pkg.start}-${pkg.end}`,
      startTime: pkg.start,
      endTime: pkg.end,
      hours: pkg.hours,
    };

    onBlocksChange([...selectedBlocks, newBlock]);
  };

  const removeBlock = (blockId: string) => {
    onBlocksChange(selectedBlocks.filter((b) => b.id !== blockId));
    setError("");
  };

  const getTimeSlotStatus = (time: string) => {
    if (isTimeBooked(time)) return "booked";
    if (isTimeInSelectedBlock(time)) return "selected";
    if (selectingStart === time) return "selecting";
    if (selectingStart) {
      const startHour = parseInt(selectingStart.split(":")[0]);
      const timeHour = parseInt(time.split(":")[0]);
      if (timeHour > startHour) return "selectable";
    }
    return "available";
  };

  const getPriceForHours = (hours: number) => {
    if (hours >= 12) return 250;
    if (hours >= 8) return 180;
    if (hours >= 4) return 100;
    return Math.ceil(hours * 25);
  };

  return (
    <div className="space-y-6">
      {/* Quick Packages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((pkg) => (
              <Button
                key={pkg.label}
                variant="outline"
                className="h-auto flex-col gap-1 py-3 text-left"
                onClick={() => handlePackageSelect(pkg)}
              >
                <span className="text-sm font-medium">{pkg.label}</span>
                <span className="text-xs text-muted-foreground">₹{getPriceForHours(pkg.hours)}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Time Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Custom Time Blocks
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectingStart 
              ? `Select end time (min 4 hours from ${selectingStart})`
              : "Click to select start time, then end time (min 4 hours each)"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {ALL_TIME_SLOTS.map((time) => {
              const status = getTimeSlotStatus(time);
              return (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  disabled={status === "booked" || status === "selected"}
                  className={cn(
                    "text-xs",
                    status === "selecting" && "ring-2 ring-primary bg-primary text-primary-foreground",
                    status === "selected" && "bg-success/20 border-success text-success",
                    status === "booked" && "bg-muted text-muted-foreground line-through",
                    status === "selectable" && selectingStart && "border-primary/50"
                  )}
                  onClick={() => handleTimeClick(time)}
                >
                  {time}
                </Button>
              );
            })}
          </div>

          {selectingStart && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectingStart(null)}
              className="text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel selection
            </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Blocks Summary */}
      {selectedBlocks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Selected Time Blocks</span>
              <Badge variant="secondary" className="font-mono">
                {totalHours} hours total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {block.startTime} - {block.endTime}
                  </span>
                  <Badge variant="outline">{block.hours}h</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBlock(block.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Estimated Price</span>
              <span className="text-lg font-bold">₹{getPriceForHours(totalHours)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function getTotalHours(blocks: TimeBlock[]): number {
  return blocks.reduce((sum, b) => sum + b.hours, 0);
}