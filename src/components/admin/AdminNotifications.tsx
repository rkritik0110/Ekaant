import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Bell, Coffee, Droplets, Volume2, HelpCircle } from "lucide-react";

export function AdminNotifications() {
    const { role } = useAuth();

    useEffect(() => {
        if (role !== "admin") return;

        const channel = supabase
            .channel("admin-notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "silent_requests",
                },
                async (payload) => {
                    const newRequest = payload.new as any;

                    // Fetch additional details if needed (e.g., user name, cabin number)
                    // For immediate notification, we can show the type.

                    const iconMap = {
                        water: Droplets,
                        coffee: Coffee,
                        noise_complaint: Volume2,
                        assistance: HelpCircle,
                    };

                    const Icon = iconMap[newRequest.request_type as keyof typeof iconMap] || Bell;

                    toast(
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">New {newRequest.request_type.replace("_", " ")} Request</p>
                                <p className="text-sm text-muted-foreground">
                                    A new request has been submitted.
                                </p>
                            </div>
                        </div>,
                        {
                            duration: 5000,
                            position: "top-right",
                        }
                    );

                    // Optional: Play sound
                    // const audio = new Audio("/notification.mp3");
                    // audio.play().catch(e => console.error("Error playing sound:", e));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [role]);

    return null; // This component renders nothing visually, just handles logic
}
