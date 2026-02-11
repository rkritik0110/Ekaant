import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeBlockSelector, TimeBlock } from "./TimeBlockSelector";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";

export interface SlotSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedBlocks: TimeBlock[];
  onBlocksChange: (blocks: TimeBlock[]) => void;
  isMonthly: boolean;
  onMonthlyChange: (isMonthly: boolean) => void;
  bookedSlots?: { startTime: string; endTime: string }[];
}

export function SlotSelector({
  selectedDate,
  onDateChange,
  selectedBlocks,
  onBlocksChange,
  isMonthly,
  onMonthlyChange,
  bookedSlots = [],
}: SlotSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Monthly Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-pass">Monthly Pass</Label>
              <p className="text-sm text-muted-foreground">
                Unlimited access for ₹2,500/month
              </p>
            </div>
            <Switch
              id="monthly-pass"
              checked={isMonthly}
              onCheckedChange={onMonthlyChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
        </CardContent>
      </Card>


      {/* Time Block Selection (only for non-monthly) */}
      {!isMonthly && (
        <TimeBlockSelector
          selectedBlocks={selectedBlocks}
          onBlocksChange={onBlocksChange}
          bookedSlots={bookedSlots}
        />
      )}
    </div>
  );
}

export function getBlocksPrice(blocks: TimeBlock[]): number {
  const totalHours = blocks.reduce((sum, b) => sum + b.hours, 0);
  if (totalHours >= 12) return 250;
  if (totalHours >= 8) return 180;
  if (totalHours >= 4) return 100;
  return Math.ceil(totalHours * 25);
}
