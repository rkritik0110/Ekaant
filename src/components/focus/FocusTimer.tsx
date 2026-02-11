import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFocusSessions } from "@/hooks/useFocusSessions";
import { Play, Square, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusTimerProps {
  cabinId?: string;
  onSessionEnd?: (durationMinutes: number) => void;
}

export function FocusTimer({ cabinId, onSessionEnd }: FocusTimerProps) {
  const { activeSession, startSession, endSession } = useFocusSessions();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (activeSession) {
      const updateElapsed = () => {
        const started = new Date(activeSession.started_at);
        const now = new Date();
        setElapsedSeconds(Math.floor((now.getTime() - started.getTime()) / 1000));
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(0);
    }
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleToggle = async () => {
    if (activeSession) {
      const durationMinutes = await endSession();
      if (durationMinutes > 0 && onSessionEnd) {
        onSessionEnd(durationMinutes);
      }
    } else {
      await startSession(cabinId);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-500 glass-card",
        activeSession && "border-success/30 bg-success/5"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer display */}
        <motion.div
          className="flex flex-col items-center justify-center py-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={cn(
              "relative mb-4 flex h-40 w-40 items-center justify-center rounded-full",
              activeSession && "animate-pulse-ring"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 rounded-full transition-colors duration-500",
                activeSession ? "bg-success/10" : "bg-muted/50"
              )}
            />
            <motion.span
              key={elapsedSeconds}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
              className="relative z-10 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
            >
              {formatTime(elapsedSeconds)}
            </motion.span>
          </motion.div>
          <AnimatePresence mode="wait">
            {activeSession && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm text-success"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                Session in progress
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Control button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            onClick={handleToggle}
            size="lg"
            className={cn(
              "w-full h-14 text-lg transition-all duration-300",
              activeSession
                ? "bg-destructive hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25"
                : "bg-success hover:bg-success/90 hover:shadow-lg hover:shadow-success/25"
            )}
          >
            <AnimatePresence mode="wait">
              {activeSession ? (
                <motion.span
                  key="stop"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Check Out
                </motion.span>
              ) : (
                <motion.span
                  key="start"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Check In
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground">
          {activeSession
            ? "Tap to end your focus session"
            : "Scan QR at your desk or tap to start"}
        </p>
      </CardContent>
    </Card>
  );
}
