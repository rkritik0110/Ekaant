import { motion } from "framer-motion";
import { Cabin } from "@/hooks/useCabins";
 import { CabinCard } from "./CabinCard";
import { Skeleton } from "@/components/ui/skeleton";
 
 interface SeatMapProps {
   cabins: Cabin[];
   isLoading: boolean;
   selectedCabin: Cabin | null;
   onSelectCabin: (cabin: Cabin) => void;
   cabinAvailability?: Map<string, { startTime: string; endTime: string }[]>;
 }
 
 export function SeatMap({ cabins, isLoading, selectedCabin, onSelectCabin, cabinAvailability }: SeatMapProps) {
   if (isLoading) {
     return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-4">
       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
         <h3 className="text-lg font-semibold">Select Your Seat</h3>
         <div className="flex flex-wrap items-center gap-3 text-xs">
           <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-cabin-available shadow-sm shadow-cabin-available/50" />
             <span>Available</span>
           </div>
           <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
             <span>Partial</span>
           </div>
           <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-cabin-hold shadow-sm shadow-cabin-hold/50 animate-pulse" />
             <span>On Hold</span>
           </div>
           <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-cabin-occupied shadow-sm shadow-cabin-occupied/50 opacity-60" />
             <span>Full Day</span>
           </div>
         </div>
       </div>
 
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 shadow-lg"
      >
         {/* Room entrance indicator */}
         <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-muted/50 px-4 py-1 text-xs text-muted-foreground border border-border/30">
             Entrance
           </div>
         </div>
 
         {/* Seat grid - 5 columns x 4 rows = 20 cabins */}
        <motion.div 
          className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.03 }
            }
          }}
        >
          {cabins.map((cabin, index) => (
            <motion.div
              key={cabin.id}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CabinCard
                cabin={cabin}
                isSelected={selectedCabin?.id === cabin.id}
                onSelect={onSelectCabin}
                bookedSlots={cabinAvailability?.get(cabin.id) || []}
              />
            </motion.div>
           ))}
        </motion.div>
 
         {/* Exit indicator */}
         <div className="mt-4 flex justify-center">
          <div className="rounded-full bg-muted/50 px-4 py-1 text-xs text-muted-foreground border border-border/30">
             Emergency Exit
           </div>
         </div>
      </motion.div>
       
       <p className="text-center text-xs text-muted-foreground">
         Tap on partially booked seats to see available time slots
       </p>
     </div>
   );
 }
