import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Subscription } from "@/hooks/useSubscription";
import { Wallet, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SubscriptionWalletProps {
  subscription: Subscription | null;
  hoursUsed: number;
  percentageUsed: number;
}

export function SubscriptionWallet({
  subscription,
  hoursUsed,
  percentageUsed,
}: SubscriptionWalletProps) {
  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Wallet className="mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="font-semibold">No Active Subscription</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Subscribe to a monthly plan and track your hours here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5" />
          Hour Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">{subscription.hours_remaining}</p>
            <p className="text-sm text-muted-foreground">hours remaining</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-muted-foreground">
              {hoursUsed} / {subscription.hours_total}
            </p>
            <p className="text-sm text-muted-foreground">hours used</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={percentageUsed} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {percentageUsed}% of your monthly hours used
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Valid until</span>
          </div>
          <span className="font-medium">
            {format(new Date(subscription.valid_until), "MMM d, yyyy")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
