 import { useEffect, useState } from "react";
 import { format, differenceInSeconds } from "date-fns";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Booking } from "@/hooks/useBookings";
 import { MapPin, Clock, X, Lock } from "lucide-react";
 import { Progress } from "@/components/ui/progress";
 import { Badge } from "@/components/ui/badge";
 
 interface ActiveBookingCardProps {
   bookings: Booking[];
   onCancel: (id: string) => void;
 }
 
 // Helper to clean time strings with timezone suffix (e.g., "14:00:00+00")
 function cleanTime(time: string): string {
   const plusIndex = time.indexOf('+');
   if (plusIndex > 0) return time.slice(0, plusIndex);
   const parts = time.split(':');
   if (parts.length >= 2) {
     return parts.slice(0, 2).join(':') + (parts[2] ? ':' + parts[2].split('+')[0].split('-')[0] : '');
   }
   return time;
 }
 
 interface TimeBlockInfo {
   startTime: string;
   endTime: string;
   isActive: boolean;
   isPast: boolean;
 }
 
 function getTimeBlocks(bookings: Booking[]): TimeBlockInfo[] {
   const now = new Date();
   return bookings.map((booking) => {
     const startClean = cleanTime(booking.start_time).slice(0, 5);
     const endClean = cleanTime(booking.end_time).slice(0, 5);
     const startDateTime = new Date(`${booking.booking_date}T${startClean}`);
     const endDateTime = new Date(`${booking.booking_date}T${endClean}`);
     
     return {
       startTime: startClean,
       endTime: endClean,
       isActive: now >= startDateTime && now < endDateTime,
       isPast: now >= endDateTime,
     };
   });
 }
 
 export function ActiveBookingCard({ bookings, onCancel }: ActiveBookingCardProps) {
   const [timeRemaining, setTimeRemaining] = useState<number>(0);
   const [progress, setProgress] = useState<number>(0);
 
   // Get the currently active or next upcoming booking
   const now = new Date();
   const sortedBookings = [...bookings].sort((a, b) => {
     const aStart = cleanTime(a.start_time);
     const bStart = cleanTime(b.start_time);
     return aStart.localeCompare(bStart);
   });
 
   const currentBooking = sortedBookings.find((b) => {
     const startClean = cleanTime(b.start_time).slice(0, 5);
     const endClean = cleanTime(b.end_time).slice(0, 5);
     const endDateTime = new Date(`${b.booking_date}T${endClean}`);
     return endDateTime > now;
   }) || sortedBookings[0];
 
   const timeBlocks = getTimeBlocks(sortedBookings);
 
   useEffect(() => {
     if (!currentBooking) return;
     
     const startTimeClean = cleanTime(currentBooking.start_time);
     const endTimeClean = cleanTime(currentBooking.end_time);
     
     const calculateTime = () => {
       const now = new Date();
       const startDateTime = new Date(`${currentBooking.booking_date}T${startTimeClean}`);
       const endDateTime = new Date(`${currentBooking.booking_date}T${endTimeClean}`);
 
       const totalSeconds = differenceInSeconds(endDateTime, startDateTime);
       const remaining = differenceInSeconds(endDateTime, now);
       const elapsed = totalSeconds - remaining;
 
       setTimeRemaining(Math.max(0, remaining));
       setProgress(Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100)));
     };
 
     calculateTime();
     const interval = setInterval(calculateTime, 1000);
 
     return () => clearInterval(interval);
   }, [currentBooking]);
 
   const formatTimeRemaining = () => {
     const hours = Math.floor(timeRemaining / 3600);
     const minutes = Math.floor((timeRemaining % 3600) / 60);
     const seconds = timeRemaining % 60;
 
     if (hours > 0) {
       return `${hours}h ${minutes}m remaining`;
     }
     if (minutes > 0) {
       return `${minutes}m ${seconds}s remaining`;
     }
     return `${seconds}s remaining`;
   };
 
   if (!currentBooking) return null;
 
   return (
     <Card className="border-success/30 bg-success/5">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="flex items-center gap-2 text-lg">
             <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
             Active Session
           </CardTitle>
           <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-muted-foreground hover:text-destructive"
             onClick={() => onCancel(currentBooking.id)}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
           <div className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
               <MapPin className="h-6 w-6" />
             </div>
             <div>
                <p className="text-2xl font-bold">Seat #{currentBooking.cabin?.cabin_number}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(currentBooking.booking_date), "MMM d, yyyy")}
                  </p>
                  {currentBooking.has_locker && (
                    <Badge variant="outline" className="border-[hsl(38,47%,59%)] text-[hsl(38,60%,65%)] text-xs">
                      <Lock className="mr-1 h-3 w-3" />
                      Locker
                    </Badge>
                  )}
                </div>
             </div>
           </div>
           <div className="text-left sm:text-right">
             <div className="flex items-center gap-1.5 text-success">
               <Clock className="h-4 w-4" />
               <span className="font-semibold">{formatTimeRemaining()}</span>
             </div>
           </div>
         </div>
 
         {/* Show all booked time blocks */}
         <div className="space-y-2">
           <p className="text-sm text-muted-foreground">Your booked slots:</p>
           <div className="flex flex-wrap gap-2">
             {timeBlocks.map((block, idx) => (
               <Badge
                 key={idx}
                 variant={block.isActive ? "default" : block.isPast ? "secondary" : "outline"}
                 className={block.isActive ? "bg-success text-success-foreground" : ""}
               >
                 {block.startTime} - {block.endTime}
                 {block.isActive && " (Now)"}
               </Badge>
             ))}
           </div>
         </div>
 
         <div className="space-y-2">
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Current Block Progress</span>
             <span className="font-medium">{Math.round(progress)}%</span>
           </div>
           <Progress value={progress} className="h-2" />
         </div>
       </CardContent>
     </Card>
   );
 }
