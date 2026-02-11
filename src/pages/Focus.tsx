import { FocusTimer } from "@/components/focus/FocusTimer";
import { FocusMetrics } from "@/components/focus/FocusMetrics";
import { Leaderboard } from "@/components/focus/Leaderboard";
import { GoalTracker } from "@/components/focus/GoalTracker";
import { SilentRequestButtons } from "@/components/focus/SilentRequestButtons";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { useBookings } from "@/hooks/useBookings";
import { useGoals } from "@/hooks/useGoals";
import { LoadingPage } from "@/components/ui/loading";

export default function Focus() {
  const { stats, isLoading: sessionsLoading } = useFocusSessions();
  const { activeBooking, isLoading: bookingsLoading } = useBookings();
  const { goals, isLoading: goalsLoading, createGoal, deleteGoal, refetch: refetchGoals } = useGoals();

  const handleSessionEnd = async (_durationMinutes: number) => {
    // Refetch goals triggers sync_goal_progress which computes hours from focus_sessions
    await refetchGoals();
  };

  if (sessionsLoading || bookingsLoading || goalsLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="container py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Focus Hub</h1>
        <p className="text-muted-foreground">Track your deep work sessions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Timer and Metrics */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FocusTimer cabinId={activeBooking?.cabin_id} onSessionEnd={handleSessionEnd} />
            <FocusMetrics stats={stats} />
          </div>

          {/* Leaderboard */}
          <Leaderboard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GoalTracker
            goals={goals}
            onCreateGoal={createGoal}
            onDeleteGoal={deleteGoal}
          />
          <SilentRequestButtons />
        </div>
      </div>
    </div>
  );
}
