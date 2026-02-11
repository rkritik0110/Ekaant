 import { motion } from "framer-motion";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import { cn } from "@/lib/utils";
import { Clock, Check, Lock, User } from "lucide-react";
import { 
  BatchSlot, 
  BatchType, 
  BATCH_CONFIG, 
  BATCH_ORDER,
  CabinDayAvailability 
} from "@/hooks/useBookingTimeline";
import { BookingMode, DAILY_PRICE_PER_BATCH, MONTHLY_PRICE_PER_BATCH } from "./BatchSelector";

interface BatchTimelineViewProps {
  cabinNumber: number;
  date: string;
  availability: CabinDayAvailability | null;
  isLoading: boolean;
  selectedBatches: BatchType[];
  onBatchSelect: (batch: BatchType) => void;
  onBatchDeselect: (batch: BatchType) => void;
  bookingMode: BookingMode;
}
 
 const STATUS_COLORS = {
   available: {
     bg: "bg-success/20",
     border: "border-success",
     dot: "bg-success",
     text: "text-success",
   },
   booked: {
     bg: "bg-destructive/20",
     border: "border-destructive",
     dot: "bg-destructive",
     text: "text-destructive",
   },
   held: {
     bg: "bg-amber-500/20",
     border: "border-amber-500",
     dot: "bg-amber-500",
     text: "text-amber-500",
   },
   selected: {
     bg: "bg-primary/20",
     border: "border-primary",
     dot: "bg-primary",
     text: "text-primary",
   },
 };
 
export function BatchTimelineView({
  cabinNumber,
  date,
  availability,
  isLoading,
  selectedBatches,
  onBatchSelect,
  onBatchDeselect,
  bookingMode,
}: BatchTimelineViewProps) {
  const pricePerBatch = bookingMode === "monthly" ? MONTHLY_PRICE_PER_BATCH : DAILY_PRICE_PER_BATCH;
  const priceLabel = bookingMode === "monthly" ? "/mo" : "";
   const formattedDate = new Date(date).toLocaleDateString("en-US", {
     weekday: "long",
     month: "long",
     day: "numeric",
   });
 
   const getRecommendedBatches = (selected: BatchType[]): BatchType[] => {
     if (selected.length === 0) return [];
     
     const recommended: BatchType[] = [];
     const selectedIndices = selected.map(b => BATCH_ORDER.indexOf(b));
     const minIndex = Math.min(...selectedIndices);
     const maxIndex = Math.max(...selectedIndices);
     
     // Recommend adjacent batches
     if (minIndex > 0 && !selected.includes(BATCH_ORDER[minIndex - 1])) {
       recommended.push(BATCH_ORDER[minIndex - 1]);
     }
     if (maxIndex < BATCH_ORDER.length - 1 && !selected.includes(BATCH_ORDER[maxIndex + 1])) {
       recommended.push(BATCH_ORDER[maxIndex + 1]);
     }
     
     return recommended;
   };
 
   const recommendedBatches = getRecommendedBatches(selectedBatches);
 
   const handleBatchClick = (batch: BatchSlot) => {
     if (batch.status !== "available") return;
     
     if (selectedBatches.includes(batch.batchType)) {
       onBatchDeselect(batch.batchType);
     } else {
       onBatchSelect(batch.batchType);
     }
   };
 
   if (isLoading) {
     return (
       <Card>
         <CardHeader>
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-32 mt-1" />
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
             {[1, 2, 3, 4].map((i) => (
               <Skeleton key={i} className="h-24 rounded-xl" />
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="overflow-hidden">
       <CardHeader className="bg-muted/30">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                 {cabinNumber}
               </div>
               <span>Seat #{cabinNumber}</span>
             </CardTitle>
             <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
           </div>
           <div className="flex items-center gap-2">
             <Badge variant="outline" className="text-success border-success">
               {availability?.totalAvailable || 0} slots free
             </Badge>
           </div>
         </div>
       </CardHeader>
       
       <CardContent className="p-4">
         {/* Timeline visualization */}
         <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
           <span>6 AM</span>
           <span>10 AM</span>
           <span>2 PM</span>
           <span>6 PM</span>
           <span>10 PM</span>
         </div>
         
         <div className="mb-6 flex h-3 rounded-full overflow-hidden bg-muted">
           {availability?.batches.map((batch, index) => {
             const isSelected = selectedBatches.includes(batch.batchType);
             const colors = isSelected 
               ? STATUS_COLORS.selected 
               : STATUS_COLORS[batch.status];
             
             return (
               <motion.div
                 key={batch.batchType}
                 className={cn(
                   "flex-1",
                   index > 0 && "border-l border-background",
                   isSelected ? "bg-primary" : 
                   batch.status === "available" ? "bg-success" :
                   batch.status === "held" ? "bg-amber-500" : "bg-destructive"
                 )}
                 initial={{ scaleX: 0 }}
                 animate={{ scaleX: 1 }}
                 transition={{ delay: index * 0.1, duration: 0.3 }}
               />
             );
           })}
         </div>
 
         {/* Batch cards */}
         <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
           {availability?.batches.map((batch) => {
             const config = BATCH_CONFIG[batch.batchType];
             const isSelected = selectedBatches.includes(batch.batchType);
             const isRecommended = recommendedBatches.includes(batch.batchType);
             const isAvailable = batch.status === "available";
             const colors = isSelected 
               ? STATUS_COLORS.selected 
               : STATUS_COLORS[batch.status];
 
             return (
               <motion.button
                 key={batch.batchType}
                 onClick={() => handleBatchClick(batch)}
                 disabled={!isAvailable}
                 className={cn(
                   "relative flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all",
                   colors.bg,
                   colors.border,
                   isAvailable && "hover:scale-[1.02] cursor-pointer",
                   !isAvailable && "opacity-60 cursor-not-allowed",
                   isSelected && "ring-2 ring-primary ring-offset-2"
                 )}
                 whileTap={isAvailable ? { scale: 0.98 } : undefined}
               >
                 {isRecommended && isAvailable && (
                   <Badge 
                     className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-amber-500 text-white"
                   >
                     Recommended
                   </Badge>
                 )}
                 
                 <div className="flex items-center gap-1.5 mb-1">
                   <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
                   <span className="text-sm font-medium">{config.label}</span>
                 </div>
                 
                 <div className="text-xs text-muted-foreground mb-2">
                   {config.start.replace(":00", "")} - {config.end.replace(":00", "")}
                 </div>
                 
                 <div className={cn("text-xs font-medium", colors.text)}>
                   {isSelected ? (
                     <span className="flex items-center gap-1">
                       <Check className="h-3 w-3" /> Selected
                     </span>
                   ) : batch.status === "available" ? (
                     `₹${pricePerBatch}${priceLabel}`
                   ) : batch.status === "held" ? (
                     <span className="flex items-center gap-1">
                       <Clock className="h-3 w-3" /> On Hold
                     </span>
                   ) : batch.isOwnBooking ? (
                     <span className="flex items-center gap-1">
                       <User className="h-3 w-3" /> Your Booking
                     </span>
                   ) : (
                     <span className="flex items-center gap-1">
                       <Lock className="h-3 w-3" /> Booked
                     </span>
                   )}
                 </div>
               </motion.button>
             );
           })}
         </div>
 
          {/* Add more batches hint */}
          {selectedBatches.length > 0 && selectedBatches.length < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg bg-accent/50 border border-accent p-3 text-sm"
            >
              <span className="text-foreground font-medium">
                💡 Tip: Add more batches!
              </span>
              <span className="text-muted-foreground ml-1">
                {bookingMode === "monthly"
                  ? `${selectedBatches.length} slot${selectedBatches.length > 1 ? "s" : ""} = ₹${selectedBatches.length * MONTHLY_PRICE_PER_BATCH}/mo. Add more for extended hours.`
                  : `${selectedBatches.length} slot${selectedBatches.length > 1 ? "s" : ""} = ₹${selectedBatches.length * DAILY_PRICE_PER_BATCH}. Each slot is just ₹15.`}
              </span>
            </motion.div>
          )}
       </CardContent>
     </Card>
   );
 }