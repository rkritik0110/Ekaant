 import { motion, AnimatePresence } from "framer-motion";
 import { ReactNode } from "react";
 
 interface PageTransitionProps {
   children: ReactNode;
   className?: string;
 }
 
 export function PageTransition({ children, className = "" }: PageTransitionProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -10 }}
       transition={{ duration: 0.3, ease: "easeOut" }}
       className={className}
     >
       {children}
     </motion.div>
   );
 }
 
 interface FadeInProps {
   children: ReactNode;
   delay?: number;
   className?: string;
 }
 
 export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 15 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay, ease: "easeOut" }}
       className={className}
     >
       {children}
     </motion.div>
   );
 }
 
 interface StaggerContainerProps {
   children: ReactNode;
   className?: string;
   staggerDelay?: number;
 }
 
 export function StaggerContainer({ children, className = "", staggerDelay = 0.1 }: StaggerContainerProps) {
   return (
     <motion.div
       initial="hidden"
       animate="visible"
       variants={{
         hidden: { opacity: 0 },
         visible: {
           opacity: 1,
           transition: { staggerChildren: staggerDelay }
         }
       }}
       className={className}
     >
       {children}
     </motion.div>
   );
 }
 
 export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
   return (
     <motion.div
       variants={{
         hidden: { opacity: 0, y: 20 },
         visible: { opacity: 1, y: 0 }
       }}
       transition={{ duration: 0.3, ease: "easeOut" }}
       className={className}
     >
       {children}
     </motion.div>
   );
 }