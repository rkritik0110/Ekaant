import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Award, User } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export function Leaderboard() {
  const { entries, isLoading } = useLeaderboard();
  const { user } = useAuth();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-warning" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.is_anonymous) {
      return "Anonymous Student";
    }
    return entry.display_name || "Student";
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Weekly Leaderboard
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            This Week
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No entries yet"
            description="Start a focus session to appear on the leaderboard"
            className="py-8"
          />
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
            {entries.slice(0, 10).map((entry, index) => {
              const isCurrentUser = user?.id === entry.user_id;
              return (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                  className={`flex items-center justify-between rounded-xl p-3 transition-all duration-300 ${
                    isCurrentUser
                      ? "bg-primary/10 border border-primary/20 shadow-sm"
                      : "bg-muted/30 hover:bg-muted/50 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                    >
                      {getRankIcon(entry.rank)}
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {getDisplayName(entry)}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p
                      key={entry.total_minutes}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="font-semibold"
                    >
                      {formatTime(entry.total_minutes)}
                    </motion.p>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
