import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format, addDays, startOfWeek } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Sun, Sunset, Moon } from "lucide-react";

type ShiftType = "morning" | "evening" | "night";

interface Shift {
  id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string;
  end_time: string;
}

const shiftConfig: Record<ShiftType, { label: string; icon: React.ElementType; color: string }> = {
  morning: { label: "Morning", icon: Sun, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  evening: { label: "Evening", icon: Sunset, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  night: { label: "Night", icon: Moon, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export function ShiftManager() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const fetchShifts = async () => {
    try {
      const startDate = format(currentWeekStart, "yyyy-MM-dd");
      const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .gte("shift_date", startDate)
        .lte("shift_date", endDate)
        .order("shift_date")
        .order("shift_type");

      if (error) throw error;
      setShifts(data as Shift[]);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [currentWeekStart]);

  const getShiftsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return shifts.filter((s) => s.shift_date === dateStr);
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Shift Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayShifts = getShiftsForDay(day);
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={day.toISOString()}
                className={`rounded-lg border p-2 min-h-32 ${
                  isToday ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="mb-2 text-center">
                  <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </p>
                </div>
                <div className="space-y-1">
                  {(["morning", "evening", "night"] as ShiftType[]).map((type) => {
                    const shift = dayShifts.find((s) => s.shift_type === type);
                    const config = shiftConfig[type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                          shift ? config.color : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        <span className="truncate">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
