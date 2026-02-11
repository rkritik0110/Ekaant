import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cabin } from "@/hooks/useCabins";
import { Check, Clock, Calendar, MapPin } from "lucide-react";
import { TimeBlock } from "./TimeBlockSelector";
import { Badge } from "@/components/ui/badge";

interface BookingSummaryProps {
  cabin: Cabin;
  date: Date;
  blocks: TimeBlock[];
  isMonthly: boolean;
  holdTimeRemaining: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function getBlocksPrice(blocks: TimeBlock[]): number {
  const totalHours = blocks.reduce((sum, b) => sum + b.hours, 0);
  if (totalHours >= 12) return 250;
  if (totalHours >= 8) return 180;
  if (totalHours >= 4) return 100;
  return Math.ceil(totalHours * 25);
}

export function BookingSummary({
  cabin,
  date,
  blocks,
  isMonthly,
  holdTimeRemaining,
  onConfirm,
  onCancel,
  isLoading,
}: BookingSummaryProps) {
  const totalHours = blocks.reduce((sum, b) => sum + b.hours, 0);
  const price = isMonthly ? 2500 : getBlocksPrice(blocks);

  const formatHoldTime = () => {
    const mins = Math.floor(holdTimeRemaining / 60);
    const secs = holdTimeRemaining % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Booking Summary</CardTitle>
          {holdTimeRemaining > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-warning">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">{formatHoldTime()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cabin</p>
            <p className="font-semibold">Seat #{cabin.cabin_number}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            {isMonthly ? (
              <p className="font-semibold">Monthly Pass (Unlimited Access)</p>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold">{totalHours} Hours Total</p>
                <div className="flex flex-wrap gap-1">
                  {blocks.map((block) => (
                    <Badge key={block.id} variant="secondary" className="text-xs">
                      {block.startTime} - {block.endTime}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">₹{price}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} className="flex-1" disabled={isLoading}>
          <Check className="mr-2 h-4 w-4" />
          Confirm Booking
        </Button>
      </CardFooter>
    </Card>
  );
}
