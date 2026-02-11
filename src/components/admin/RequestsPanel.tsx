import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSilentRequests, RequestType, RequestStatus } from "@/hooks/useSilentRequests";
import { Bell, Check, RefreshCw, Droplets, Coffee, Volume2, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";

const requestIcons: Record<RequestType, React.ElementType> = {
  water: Droplets,
  coffee: Coffee,
  noise_complaint: Volume2,
  assistance: HelpCircle,
};

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  acknowledged: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
};

export function RequestsPanel() {
  const { requests, isLoading, updateRequestStatus, refetch } = useSilentRequests();

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const otherRequests = requests.filter((r) => r.status !== "pending").slice(0, 10);

  const handleComplete = async (requestId: string) => {
    await updateRequestStatus(requestId, "completed");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Silent Requests
            {pendingRequests.length > 0 && (
              <Badge className="bg-warning text-warning-foreground">
                {pendingRequests.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No requests"
            description="Student requests will appear here"
            className="py-8"
          />
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Pending requests first */}
            {pendingRequests.map((request) => {
              const Icon = requestIcons[request.request_type];
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                      <Icon className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {request.request_type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleComplete(request.id)}>
                    <Check className="mr-1 h-4 w-4" />
                    Done
                  </Button>
                </div>
              );
            })}

            {/* Other requests */}
            {otherRequests.map((request) => {
              const Icon = requestIcons[request.request_type];
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {request.request_type.replace("_", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[request.status]}>
                    {request.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
