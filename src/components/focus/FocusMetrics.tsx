import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FocusStats } from "@/hooks/useFocusSessions";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface FocusMetricsProps {
  stats: FocusStats;
}

export function FocusMetrics({ stats }: FocusMetricsProps) {
  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const metrics = [
    {
      label: "Today",
      value: formatHours(stats.today_minutes),
      icon: Clock,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "This Week",
      value: formatHours(stats.week_minutes),
      icon: Calendar,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "This Month",
      value: formatHours(stats.month_minutes),
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Focus Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div
                className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${metric.bg}`}
              >
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Focus Time</p>
          <p className="text-3xl font-bold">{formatHours(stats.total_minutes)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
