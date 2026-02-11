import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats, AdminStats } from "@/hooks/useAdminStats";
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Bell,
  TrendingUp,
  UserCheck,
} from "lucide-react";

interface StatsGridProps {
  stats: AdminStats;
  onNavigate?: (view: string) => void;
}

export function StatsGrid({ stats, onNavigate }: StatsGridProps) {
  const cards = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      icon: CalendarDays,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Active Sessions",
      value: stats.activeBookings.toString(),
      icon: Clock,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions.toString(),
      icon: UserCheck,
      color: "text-info",
      bg: "bg-info/10",
      onClick: () => onNavigate?.("subscriptions"),
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSubscriptions.toString(),
      icon: AlertTriangle,
      color: stats.expiringSubscriptions > 0 ? "text-warning" : "text-muted-foreground",
      bg: stats.expiringSubscriptions > 0 ? "bg-warning/10" : "bg-muted",
      onClick: () => onNavigate?.("subscriptions"),
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests.toString(),
      icon: Bell,
      color: stats.pendingRequests > 0 ? "text-warning" : "text-muted-foreground",
      bg: stats.pendingRequests > 0 ? "bg-warning/10" : "bg-muted",
      onClick: () => onNavigate?.("operations"),
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={card.onClick ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}
          onClick={card.onClick}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
