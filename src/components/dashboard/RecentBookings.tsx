import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Booking, BookingStatus } from "@/hooks/useBookings";
import { History, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface RecentBookingsProps {
  bookings: Booking[];
}

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const slotLabels: Record<string, string> = {
  four_hours: "4h",
  eight_hours: "8h",
  full_day: "Full Day",
  monthly: "Monthly",
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const recentBookings = bookings.slice(0, 5);
  const now = new Date();

  // Helper to determine display status
  const getDisplayStatus = (booking: Booking) => {
    if (booking.status !== "confirmed") return booking.status;

    // Check if booking is expired
    const dateStr = booking.booking_date; // YYYY-MM-DD
    // Handle time format (HH:MM:SS or HH:MM)
    const timeParts = booking.end_time.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    const endDateTime = new Date(dateStr);
    endDateTime.setHours(hours, minutes, 0, 0);

    if (endDateTime < now) {
      return "completed";
    }
    return "confirmed";
  };

  if (recentBookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={History}
            title="No bookings yet"
            description="Your booking history will appear here"
            className="py-6"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentBookings.map((booking) => {
            const displayStatus = getDisplayStatus(booking);
            return (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                    #{booking.cabin?.cabin_number}
                  </div>
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.booking_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(booking as any).has_locker && (
                    <Badge variant="outline" className="border-[hsl(38,47%,59%)] text-[hsl(38,60%,65%)] text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locker
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {slotLabels[booking.slot_type]}
                  </Badge>
                  <Badge className={statusStyles[displayStatus as BookingStatus]}>
                    {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
