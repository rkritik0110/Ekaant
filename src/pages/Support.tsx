import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Mail, MapPin, Star, Send, Phone, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "919876543210"; // Replace with actual number

export default function Support() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id || null,
        rating,
        comment: comment.trim() || null,
      });

      if (error) {
        console.error("Feedback submission error:", error);
        throw error;
      }

      toast.success("Thank you for your feedback! 🙏");
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
          >
            <HelpCircle className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            We're here to help. Reach out anytime.
          </p>
        </div>

        {/* Contact Cards - Bento Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card p-6 transition-colors hover:border-success/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success transition-all group-hover:bg-success group-hover:text-white group-hover:shadow-lg">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Quick replies, usually within minutes
              </p>
              <Badge variant="outline" className="text-success border-success/50">
                <Phone className="mr-1 h-3 w-3" />
                Chat Now
              </Badge>
            </div>
          </motion.a>

          <motion.a
            href="mailto:support@ekaant.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card p-6 transition-colors hover:border-primary/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-sm text-muted-foreground">
                support@ekaant.com
              </p>
              <Badge variant="outline" className="text-primary border-primary/50">
                Send Email
              </Badge>
            </div>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card p-6 transition-colors hover:border-info/50 sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10 text-info transition-all group-hover:bg-info group-hover:text-white group-hover:shadow-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Visit Us</h3>
              <p className="text-sm text-muted-foreground">
                Ekaant Study Space, Your City
              </p>
              <Badge variant="outline" className="text-info border-info/50">
                Get Directions
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Map Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-64 w-full bg-muted flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4!3d37.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQyJzAwLjAiTiAxMjLCsDI0JzAwLjAiVw!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="relative overflow-hidden">
            {/* Moving border effect */}
            <div className="absolute inset-0 rounded-xl p-[1px] overflow-hidden">
              <motion.div
                className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,hsl(var(--primary))_360deg)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="relative bg-card rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Share Your Experience
                </CardTitle>
                <CardDescription>
                  Your feedback helps us improve Ekaant for everyone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            (hoverRating || rating) >= star
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground"
                    >
                      {rating === 1 && "😟 We'll do better!"}
                      {rating === 2 && "😐 Room for improvement"}
                      {rating === 3 && "🙂 Good experience"}
                      {rating === 4 && "😊 Great!"}
                      {rating === 5 && "🤩 Amazing! Thank you!"}
                    </motion.p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments (optional)</label>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || rating === 0}
                  className="w-full group"
                >
                  <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
