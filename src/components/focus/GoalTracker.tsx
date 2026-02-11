import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/hooks/useGoals";
import { Target, Plus, Trash2, CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GoalTrackerProps {
  goals: Goal[];
  onCreateGoal: (title: string, targetHours: number, deadline?: string) => Promise<boolean>;
  onDeleteGoal: (goalId: string) => Promise<boolean>;
}

export function GoalTracker({ goals, onCreateGoal, onDeleteGoal }: GoalTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalHours, setNewGoalHours] = useState("100");

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) return;

    const success = await onCreateGoal(newGoalTitle, parseInt(newGoalHours) || 100);
    if (success) {
      setNewGoalTitle("");
      setNewGoalHours("100");
      setIsDialogOpen(false);
    }
  };

  const getProgressPercent = (goal: Goal) => {
    return Math.min(100, Math.round((goal.current_hours / goal.target_hours) * 100));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Goal Tracker
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set a New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., GATE 2026, UPSC Prelims"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-hours">Target Hours</Label>
                  <Input
                    id="goal-hours"
                    type="number"
                    placeholder="100"
                    value={newGoalHours}
                    onChange={(e) => setNewGoalHours(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateGoal} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals set"
            description="Set a goal to track your progress"
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = getProgressPercent(goal);
              return (
                <div
                  key={goal.id}
                  className={`rounded-lg border p-4 ${
                    goal.is_completed ? "border-success/30 bg-success/5" : "border-border"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.is_completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Target className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold">{goal.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {goal.current_hours.toFixed(1)}h / {goal.target_hours}h
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
