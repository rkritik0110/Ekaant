import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowRight, Wifi, Wind, Armchair, BatteryCharging, VolumeX } from "lucide-react";
import heroImage from "@/assets/hero.png";
import experienceImage from "@/assets/experience.png";
import bookingImage from "@/assets/booking.png";
import solutionImage from "@/assets/solution.png";

const amenities = [
  {
    icon: Wifi,
    title: "High-Speed Wi-Fi 6",
    description: "Unlimited, fiber-optic speed for seamless research and streaming.",
  },
  {
    icon: Wind,
    title: "Centralized AC",
    description: "Climate-controlled environment for year-round comfort.",
  },
  {
    icon: Armchair,
    title: "Ergonomic Seating",
    description: "Spine-support chairs designed for long study hours.",
  },
  {
    icon: BatteryCharging,
    title: "24/7 Power Backup",
    description: "Uninterrupted focus with zero downtime, ever.",
  },
  {
    icon: VolumeX,
    title: "Soundproof Zones",
    description: "Pin-drop silence guarantee for deep concentration.",
  },
];

export default function Index() {
  const { user, role } = useAuth();
  const { theme } = useTheme();
  

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center -mt-16 pt-16">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Ekaant Study Space" className="h-full w-full object-cover" />
          <div
            className={
              theme === "dark"
                ? "absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent"
                : "absolute inset-0 bg-black/50"
            }
          />
        </div>
        <div className="container relative py-20 sm:py-32 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className={
                theme === "dark"
                  ? "mb-6 inline-flex items-center rounded-full border border-border bg-background/80 backdrop-blur-md px-4 py-2 text-sm shadow-premium"
                  : "mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-white"
              }
            >
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-success" />
              Now accepting bookings
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={
                theme === "dark"
                  ? "mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground"
                  : "mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white"
              }
            >
              Your sanctuary for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                deep work
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={
                theme === "dark"
                  ? "mb-8 text-lg text-muted-foreground sm:text-xl leading-relaxed"
                  : "mb-8 text-lg text-[#E5E7EB] sm:text-xl leading-relaxed"
              }
            >
              Ekaant provides distraction-free study cabins with smart booking, focus tracking, and a
              community of serious learners.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              {user ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg" variant="glow" className="group">
                    <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button asChild size="lg" variant="glow" className="group">
                      <Link to="/book">
                        Book a Seat
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className={
                        theme === "dark"
                          ? "backdrop-blur-sm bg-background/50"
                          : "backdrop-blur-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                      }
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 sm:py-28 overflow-hidden bg-background">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground leading-tight">
                Premium Study Experience
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Each cabin is designed for maximum focus with ambient lighting, ergonomic seating,
                power outlets, and complete privacy.
              </p>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Ergonomic chairs and desks
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Personal LED lighting
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Multiple power outlets and USB ports
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Soundproof partitions
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="order-1 lg:order-2"
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                src={experienceImage}
                alt="Premium study cabin"
                className="rounded-2xl shadow-premium-lg w-full ring-1 ring-border/20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-20 sm:py-28 bg-section-alt">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                src={bookingImage}
                alt="Smart seat booking system"
                className="rounded-2xl shadow-premium-lg w-full ring-1 ring-border/20"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground leading-tight">
                Smart Seat Booking
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                See real-time availability with our visual seat map. Book multiple time blocks, see
                which slots are available, and reserve your spot in seconds.
              </p>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Real-time seat availability
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Book multiple time slots per day
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  15-minute hold guarantee
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Flexible pricing packages
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 sm:py-28 overflow-hidden bg-background">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground leading-tight">
                Book On The Go
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Our mobile-friendly platform lets you check availability, book seats, and manage
                your sessions from anywhere.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" variant="glow" className="group">
                  <Link to={user ? "/book" : "/signup"}>
                    Start Booking
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                src={solutionImage}
                alt="Mobile booking experience"
                className="rounded-2xl shadow-premium-lg max-w-sm w-full ring-1 ring-border/20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Amenities Section - Glassmorphism */}
      <section className="py-20 sm:py-28 bg-section-alt">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground leading-tight">
              World-Class Amenities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Everything crafted for uninterrupted, distraction-free study sessions
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity, index) => (
              <motion.div
                key={amenity.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-border/30 backdrop-blur-md bg-card/60 p-6 shadow-premium transition-all duration-300 hover:shadow-premium-hover hover:border-primary/30"
              >
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div
                    className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20"
                    style={{
                      boxShadow: "0 0 0px hsl(var(--primary) / 0)",
                    }}
                  >
                    <amenity.icon
                      className="h-7 w-7 text-primary transition-all duration-300"
                      style={{
                        filter: "drop-shadow(0 0 0px hsl(var(--primary) / 0))",
                      }}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{amenity.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {amenity.description}
                  </p>
                </div>
                {/* Glow effect on hover via CSS */}
                <style>{`
                  .group:hover .h-14 {
                    box-shadow: 0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.1) !important;
                  }
                  .group:hover .h-7 {
                    filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.6)) !important;
                  }
                `}</style>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center p-6 rounded-2xl bg-card shadow-premium"
            >
              <p className="text-4xl font-bold text-primary">20</p>
              <p className="text-muted-foreground">Silent Cabins</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center p-6 rounded-2xl bg-card shadow-premium"
            >
              <p className="text-4xl font-bold text-primary">24/7</p>
              <p className="text-muted-foreground">Access Available</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center p-6 rounded-2xl bg-card shadow-premium"
            >
              <p className="text-4xl font-bold text-primary">₹15</p>
              <p className="text-muted-foreground">Starting Price</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Secure Lockers - moved to booking page */}

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl rounded-2xl bg-primary p-8 text-center text-primary-foreground sm:p-12 shadow-premium-lg"
          >
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl text-primary-foreground leading-tight">
              Ready to focus?
            </h2>
            <p className="mb-6 text-primary-foreground/90 leading-relaxed">
              Join hundreds of students who've transformed their study habits with Ekaant.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button asChild size="lg" variant="secondary" className="group">
                <Link to={user ? "/book" : "/signup"}>
                  {user ? "Book Now" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <span className="text-sm font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Ekaant – The Silentium © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Your sanctuary for deep work</p>
              <Link to="/support" className="text-sm text-primary hover:underline">
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
