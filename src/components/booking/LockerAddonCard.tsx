import { useState } from "react";
import { Lock, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockerAddonCardProps {
  isAdded: boolean;
  onToggle: (added: boolean) => void;
}

export function LockerAddonCard({ isAdded, onToggle }: LockerAddonCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
        isAdded
          ? "border-[hsl(38,47%,59%)] shadow-[0_0_30px_hsl(38,47%,59%,0.25)]"
          : "border-[hsl(38,47%,59%,0.3)] hover:border-[hsl(38,47%,59%,0.6)]"
      }`}
      style={{
        background: isAdded
          ? "linear-gradient(135deg, hsl(38,50%,18%) 0%, hsl(30,30%,12%) 50%, hsl(38,45%,20%) 100%)"
          : "linear-gradient(135deg, hsl(38,45%,15%) 0%, hsl(30,25%,10%) 50%, hsl(38,40%,16%) 100%)",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, hsl(38,60%,70%,0.4) 50%, transparent 60%)",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      {/* Gold top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(38,60%,65%), hsl(42,70%,72%), hsl(38,60%,65%), transparent)",
        }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, hsl(38,55%,50%), hsl(42,65%,60%))",
              boxShadow: "0 4px 15px hsl(38,50%,50%,0.3)",
            }}
          >
            <Lock className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-base font-bold tracking-tight"
                style={{ color: "hsl(38,60%,72%)" }}
              >
                Premium Secure Locker
              </h3>
              <Sparkles className="h-4 w-4" style={{ color: "hsl(42,70%,65%)" }} />
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "hsl(35,15%,60%)" }}>
              Keep your laptop, heavy books, and bag in your personal secure
              locker. Don't carry the weight every day.
            </p>

            {/* Price */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-xl font-bold"
                style={{ color: "hsl(38,55%,68%)" }}
              >
                ₹100
              </span>
              <span className="text-sm" style={{ color: "hsl(35,15%,50%)" }}>
                /month
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4">
          <Button
            onClick={() => onToggle(!isAdded)}
            className={`w-full rounded-xl font-semibold text-sm transition-all duration-300 ${
              isAdded
                ? "bg-[hsl(145,55%,38%)] hover:bg-[hsl(145,55%,33%)] text-white"
                : "text-white hover:opacity-90"
            }`}
            style={
              !isAdded
                ? {
                    background:
                      "linear-gradient(135deg, hsl(38,55%,48%), hsl(42,60%,55%))",
                    boxShadow: "0 4px 15px hsl(38,50%,45%,0.3)",
                  }
                : undefined
            }
          >
            {isAdded ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Locker Added
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Add Locker to Booking
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
