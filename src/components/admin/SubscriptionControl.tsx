import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { AlertTriangle, Clock, CreditCard, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscriptionItem {
  id: string;
  user_id: string;
  valid_from: string;
  valid_until: string;
  hours_remaining: number;
  hours_total: number;
  is_active: boolean;
  profile?: {
    full_name: string | null;
    phone: string | null;
  };
}

export function SubscriptionControl() {
  const [allSubs, setAllSubs] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, user_id, valid_from, valid_until, hours_remaining, hours_total, is_active")
        .eq("is_active", true)
        .order("valid_until", { ascending: true });

      if (error) throw error;

      const userIds = data?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      const enriched = data?.map(sub => ({
        ...sub,
        profile: profileMap.get(sub.user_id),
      })) || [];

      setAllSubs(enriched);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSendReminder = (sub: SubscriptionItem) => {
    toast.success(`Reminder flagged for ${sub.profile?.full_name || 'user'}`);
  };

  const getExpiryInfo = (sub: SubscriptionItem) => {
    const now = new Date();
    const until = new Date(sub.valid_until);
    const from = new Date(sub.valid_from);
    const totalDays = differenceInDays(until, from);
    const daysLeft = differenceInDays(until, now);
    const hoursLeft = differenceInHours(until, now);

    // Monthly subscription (30 days) - expiring if 5 days or less left
    if (totalDays >= 25) {
      return {
        isExpiring: daysLeft <= 5,
        label: daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
        urgency: daysLeft <= 1 ? "critical" : daysLeft <= 3 ? "warning" : "info",
      };
    }
    // Daily/short subscription - expiring if less than 1 hour left
    return {
      isExpiring: hoursLeft <= 1,
      label: hoursLeft <= 0 ? "Expired" : hoursLeft < 24 ? `${hoursLeft}h left` : `${daysLeft}d left`,
      urgency: hoursLeft <= 1 ? "critical" : hoursLeft <= 4 ? "warning" : "info",
    };
  };

  const expiringSubs = allSubs.filter(s => getExpiryInfo(s).isExpiring);
  const activeSubs = allSubs.filter(s => !getExpiryInfo(s).isExpiring);

  const renderSubCard = (sub: SubscriptionItem, showActions = false) => {
    const info = getExpiryInfo(sub);
    const borderClass = info.urgency === "critical" ? "border-destructive/30 bg-destructive/5" :
      info.urgency === "warning" ? "border-warning/30 bg-warning/5" : "border-border";
    const badgeClass = info.urgency === "critical" ? "text-destructive border-destructive" :
      info.urgency === "warning" ? "text-warning border-warning" : "text-info border-info";

    return (
      <div key={sub.id} className={`flex items-center justify-between rounded-lg border p-4 ${borderClass}`}>
        <div>
          <p className="font-medium">{sub.profile?.full_name || "Unknown User"}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Valid: {format(new Date(sub.valid_from), "MMM d")} – {format(new Date(sub.valid_until), "MMM d, yyyy")}</span>
            <Badge variant="outline" className={badgeClass}>{info.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {sub.hours_remaining}/{sub.hours_total}h remaining
          </p>
        </div>
        {showActions && (
          <Button variant="outline" size="sm" onClick={() => handleSendReminder(sub)}>
            <Mail className="mr-2 h-4 w-4" />
            Remind
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Subscriptions ({allSubs.length} active)
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expiring">
          <TabsList className="mb-4">
            <TabsTrigger value="expiring" className="gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Expiring ({expiringSubs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-3.5 w-3.5" />
              Active ({activeSubs.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="expiring">
            {expiringSubs.length === 0 ? (
              <EmptyState icon={Clock} title="No expiring subscriptions" description="All subscriptions are healthy" className="py-8" />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">{expiringSubs.map(s => renderSubCard(s, true))}</div>
            )}
          </TabsContent>
          <TabsContent value="active">
            {activeSubs.length === 0 ? (
              <EmptyState icon={CreditCard} title="No active subscriptions" description="No subscriptions found" className="py-8" />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">{activeSubs.map(s => renderSubCard(s))}</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
