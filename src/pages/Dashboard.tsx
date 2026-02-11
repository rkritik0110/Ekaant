import { Link } from "react-router-dom";
import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { ActiveBookingCard } from "@/components/dashboard/ActiveBookingCard";
 import { SubscriptionWallet } from "@/components/dashboard/SubscriptionWallet";
 import { RecentBookings } from "@/components/dashboard/RecentBookings";
 import { useBookings, Booking } from "@/hooks/useBookings";
 import { useSubscription } from "@/hooks/useSubscription";
 import { useFocusSessions } from "@/hooks/useFocusSessions";
 import { useAuth } from "@/contexts/AuthContext";
import { CardSkeleton } from "@/components/ui/skeleton";
 import { EmptyState } from "@/components/ui/empty-state";
 import { Plus, Calendar, Target, Clock } from "lucide-react";
 import { Card, CardContent } from "@/components/ui/card";
 import { format } from "date-fns";
import { PageTransition } from "@/components/ui/page-transition";

export default function Dashboard() {
  const { user } = useAuth();
   const { bookings, isLoading: bookingsLoading, cancelBooking } = useBookings();
  const { subscription, hoursUsed, percentageUsed, isLoading: subLoading } = useSubscription();
  const { stats, isLoading: statsLoading } = useFocusSessions();

  if (bookingsLoading || subLoading || statsLoading) {
    return (
      <div className="container py-6 sm:py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

   // Helper to clean time strings
   const cleanTime = (time: string): string => {
     const plusIndex = time.indexOf('+');
     if (plusIndex > 0) return time.slice(0, plusIndex);
     return time;
   };
 
   // Get all active bookings for today (confirmed and not yet ended)
   const today = format(new Date(), "yyyy-MM-dd");
   const now = new Date();
   const activeBookings = bookings.filter((b) => {
     if (b.status !== "confirmed") return false;
     if (b.booking_date !== today) return false;
     const endTimeClean = cleanTime(b.end_time).slice(0, 5);
     const endDateTime = new Date(`${b.booking_date}T${endTimeClean}`);
     return endDateTime > now;
   });
 
  return (
    <PageTransition className="container py-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild variant="outline">
              <Link to="/focus">
                <Target className="mr-2 h-4 w-4" />
                Focus Hub
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild variant="glow">
              <Link to="/book">
                <Plus className="mr-2 h-4 w-4" />
                Book a Seat
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10">
              <Clock className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatHours(stats.today_minutes)}</p>
              <p className="text-sm text-muted-foreground">Today's Focus</p>
            </div>
          </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatHours(stats.week_minutes)}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatHours(stats.total_minutes)}</p>
              <p className="text-sm text-muted-foreground">Total Focus</p>
            </div>
          </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Booking */}
           {activeBookings.length > 0 ? (
             <ActiveBookingCard bookings={activeBookings} onCancel={cancelBooking} />
          ) : (
            <EmptyState
              icon={Calendar}
              title="No active session"
              description="Book a seat to start your focus session"
              action={
                <Button asChild variant="outline">
                  <Link to="/book">Book Now</Link>
                </Button>
              }
              className="rounded-xl border border-border bg-card py-12"
            />
          )}

          {/* Recent Bookings */}
          <RecentBookings bookings={bookings} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SubscriptionWallet
            subscription={subscription}
            hoursUsed={hoursUsed}
            percentageUsed={percentageUsed}
          />
        </div>
      </div>
    </PageTransition>
  );
}
