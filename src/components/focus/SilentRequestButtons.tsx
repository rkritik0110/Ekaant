import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSilentRequests, RequestType } from "@/hooks/useSilentRequests";
import { useBookings } from "@/hooks/useBookings";
import { Droplets, Coffee, Volume2, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const requestOptions: { type: RequestType; label: string; icon: React.ElementType }[] = [
  { type: "water", label: "Water", icon: Droplets },
  { type: "coffee", label: "Coffee", icon: Coffee },
  { type: "noise_complaint", label: "Report Noise", icon: Volume2 },
  { type: "assistance", label: "Assistance", icon: HelpCircle },
];

export function SilentRequestButtons() {
  const { createRequest } = useSilentRequests();
  const { activeBooking } = useBookings();
  const [loadingType, setLoadingType] = useState<RequestType | null>(null);

  const handleRequest = async (type: RequestType) => {
    setLoadingType(type);
    await createRequest(type, activeBooking?.cabin_id);
    setLoadingType(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Silent Requests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Need something? Request silently without disturbing others.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {requestOptions.map((option) => (
            <Button
              key={option.type}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => handleRequest(option.type)}
              disabled={loadingType !== null}
            >
              {loadingType === option.type ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <option.icon className="h-6 w-6" />
              )}
              <span className="text-sm">{option.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
