import { cn } from "@/lib/utils";
import { CalendarDays, CalendarRange } from "lucide-react";

export type BookingMode = "daily" | "monthly";

interface BookingModeToggleProps {
  mode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
}

export function BookingModeToggle({ mode, onModeChange }: BookingModeToggleProps) {
  return (
    <div className="flex rounded-lg border bg-muted p-1 gap-1">
      <button
        onClick={() => onModeChange("daily")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
          mode === "daily"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarDays className="h-4 w-4" />
        <div className="text-left">
          <div>Daily</div>
          <div className="text-xs opacity-70">₹15 per slot</div>
        </div>
      </button>
      <button
        onClick={() => onModeChange("monthly")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
          mode === "monthly"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <CalendarRange className="h-4 w-4" />
        <div className="text-left">
          <div>Monthly</div>
          <div className="text-xs opacity-70">₹300 per slot</div>
        </div>
      </button>
    </div>
  );
}
