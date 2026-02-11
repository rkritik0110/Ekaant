 import { motion } from "framer-motion";
 import { Card, CardContent } from "@/components/ui/card";
 import { cn } from "@/lib/utils";
 import { Clock, AlertTriangle } from "lucide-react";
 
 interface BookingHoldTimerProps {
   timeRemaining: number;
   cabinNumber: number;
 }
 
 export function BookingHoldTimer({ timeRemaining, cabinNumber }: BookingHoldTimerProps) {
   const minutes = Math.floor(timeRemaining / 60);
   const seconds = timeRemaining % 60;
   const isUrgent = timeRemaining < 120; // Less than 2 minutes
 
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
     >
       <Card 
         className={cn(
           "overflow-hidden transition-colors",
           isUrgent 
             ? "border-destructive bg-destructive/5" 
             : "border-amber-500 bg-amber-500/5"
         )}
       >
         <CardContent className="pt-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               {isUrgent ? (
                 <motion.div
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ repeat: Infinity, duration: 1 }}
                 >
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                 </motion.div>
               ) : (
                 <Clock className="h-5 w-5 text-amber-500" />
               )}
               <div>
                 <p className="text-sm font-medium">
                   Seat #{cabinNumber} is held for you
                 </p>
                 <p className="text-xs text-muted-foreground">
                   {isUrgent 
                     ? "Hurry! Your hold is expiring soon" 
                     : "Complete your booking before the timer expires"
                   }
                 </p>
               </div>
             </div>
             
             <motion.div
               className={cn(
                 "flex items-center gap-1 rounded-lg px-3 py-2 font-mono text-lg font-bold",
                 isUrgent 
                   ? "bg-destructive/10 text-destructive" 
                   : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
               )}
               animate={isUrgent ? { scale: [1, 1.05, 1] } : undefined}
               transition={{ repeat: Infinity, duration: 0.5 }}
             >
               <span>{String(minutes).padStart(2, "0")}</span>
               <motion.span
                 animate={{ opacity: [1, 0, 1] }}
                 transition={{ repeat: Infinity, duration: 1 }}
               >
                 :
               </motion.span>
               <span>{String(seconds).padStart(2, "0")}</span>
             </motion.div>
           </div>
 
           {/* Progress bar */}
           <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
             <motion.div
               className={cn(
                 "h-full rounded-full",
                 isUrgent ? "bg-destructive" : "bg-amber-500"
               )}
               initial={{ width: "100%" }}
               animate={{ width: `${(timeRemaining / 900) * 100}%` }}
               transition={{ duration: 1, ease: "linear" }}
             />
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }