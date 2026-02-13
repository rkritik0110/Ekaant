import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Cabin, CabinStatus } from "@/hooks/useCabins";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface CabinCardProps {
  cabin: Cabin;
  isSelected: boolean;
  onSelect: (cabin: Cabin) => void;
  bookedSlots?: BookedSlot[];
}

// Check if cabin is fully booked for the day
// A full day is 16 hours (6am-10pm, covering all 4 batches)
function isFullDayBooked(slots: BookedSlot[]): boolean {
  if (slots.length === 0) return false;

  // Count the actual unique hours that are booked
  const bookedHours = new Set<number>();
  slots.forEach((slot) => {
    const start = parseInt(slot.startTime.split(":")[0]);
    const end = parseInt(slot.endTime.split(":")[0]);
    for (let h = start; h < end; h++) {
      bookedHours.add(h);
    }
  });

  // A full day booking covers at least 16 hours (all 4 batches from 6am-10pm)
  return bookedHours.size >= 16;
}

// Get available time slots
function getAvailableSlots(slots: BookedSlot[]): string[] {
  const allHours = Array.from({ length: 17 }, (_, i) => i + 6);
  const bookedHours = new Set<number>();

  slots.forEach((slot) => {
    const start = parseInt(slot.startTime.split(":")[0]);
    const end = parseInt(slot.endTime.split(":")[0]);
    for (let h = start; h < end; h++) {
      bookedHours.add(h);
    }
  });

  const available: string[] = [];
  let rangeStart: number | null = null;

  allHours.forEach((hour, idx) => {
    if (!bookedHours.has(hour)) {
      if (rangeStart === null) rangeStart = hour;
    } else if (rangeStart !== null) {
      available.push(`${rangeStart}:00-${hour}:00`);
      rangeStart = null;
    }
    if (idx === allHours.length - 1 && rangeStart !== null) {
      available.push(`${rangeStart}:00-22:00`);
    }
  });

  return available;
}

export function CabinCard({ cabin, isSelected, onSelect, bookedSlots = [] }: CabinCardProps) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isHeldByUser = cabin.held_by === user?.id;
  const hasBookings = bookedSlots.length > 0;
  const isFullDay = isFullDayBooked(bookedSlots);
  const availableSlots = getAvailableSlots(bookedSlots);

  let displayStatus: "available" | "partial" | "occupied" | "on_hold" = "available";
  if (cabin.status === "on_hold" && !isHeldByUser) {
    displayStatus = "on_hold";
  } else if (isFullDay) {
    displayStatus = "occupied";
  } else if (hasBookings) {
    displayStatus = "partial";
  }

  const statusConfig = {
    available: {
      label: "Available",
      className: "bg-cabin-available hover:bg-cabin-available/90 cursor-pointer",
    },
    partial: {
      label: "Partial",
      className: "bg-amber-500 hover:bg-amber-500/90 cursor-pointer",
    },
    occupied: {
      label: "Full Day",
      className: "bg-cabin-occupied cursor-not-allowed opacity-75",
    },
    on_hold: {
      label: "On Hold",
      className: "bg-cabin-hold cursor-not-allowed",
    },
  };

  const config = statusConfig[displayStatus];
  const canSelect = displayStatus !== "occupied" && (displayStatus !== "on_hold" || isHeldByUser);

  // 3D tilt effect handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const cardContent = (
    <button
      ref={cardRef}
      onClick={() => canSelect && onSelect(cabin)}
      disabled={!canSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? "transform 0.4s ease-out" : "none",
      }}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-lg p-2 text-white transition-all focus-ring",
        "shadow-lg hover:shadow-xl",
        config.className,
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isHeldByUser && "bg-cabin-hold cursor-pointer animate-pulse"
      )}
      aria-label={`Cabin ${cabin.cabin_number} - ${config.label}`}
    >
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
      <span className="relative text-xl font-bold drop-shadow-sm">{cabin.cabin_number}</span>
      <span className="relative mt-1 text-[10px] uppercase tracking-wide opacity-90">
        {isHeldByUser ? "Your Hold" : config.label}
      </span>
    </button>
  );

  if (hasBookings && !isFullDay) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1 text-xs">
              <p className="font-medium">Booked slots:</p>
              {bookedSlots.map((slot, i) => (
                <p key={i} className="text-destructive">{slot.startTime} - {slot.endTime}</p>
              ))}
              <p className="font-medium pt-1">Available:</p>
              {availableSlots.map((slot, i) => (
                <p key={i} className="text-success">{slot}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}
