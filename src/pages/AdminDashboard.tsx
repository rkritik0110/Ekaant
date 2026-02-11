import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/loading";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StudentRegistry } from "@/components/admin/StudentRegistry";
import { LiveOperationsFeed } from "@/components/admin/LiveOperationsFeed";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { SubscriptionControl } from "@/components/admin/SubscriptionControl";
import { AccessControl } from "@/components/admin/AccessControl";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useState } from "react";

type AdminView = "overview" | "students" | "operations" | "subscriptions" | "access";

const ADMIN_EMAIL = "rkritik1922004@gmail.com";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, dailyRevenue, isLoading } = useAdminStats();
  const [activeView, setActiveView] = useState<AdminView>("overview");

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return <LoadingPage />;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  const viewTitles: Record<AdminView, { title: string; desc: string }> = {
    overview: { title: "Dashboard Overview", desc: "Monitor your library at a glance" },
    students: { title: "Student Registry", desc: "Manage all registered students" },
    operations: { title: "Live Operations Feed", desc: "Real-time service requests from cabins" },
    subscriptions: { title: "Subscriptions", desc: "Active and expiring subscriptions" },
    access: { title: "Access Control", desc: "Manage user access and blocks" },
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6 sm:p-8 overflow-auto">
          <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl text-foreground">
                {viewTitles[activeView].title}
              </h1>
              <p className="text-muted-foreground">
                {viewTitles[activeView].desc}
              </p>
            </div>
          </div>

          {activeView === "overview" && (
            <div className="space-y-6">
              <StatsGrid stats={stats} onNavigate={(view) => setActiveView(view as AdminView)} />
              <div className="grid gap-6 lg:grid-cols-2">
                <RevenueChart data={dailyRevenue} />
                <SubscriptionControl />
              </div>
            </div>
          )}

          {activeView === "students" && <StudentRegistry />}
          {activeView === "operations" && <LiveOperationsFeed />}
          {activeView === "subscriptions" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <SubscriptionControl />
              <AccessControl />
            </div>
          )}
          {activeView === "access" && <AccessControl />}
        </main>
      </div>
    </SidebarProvider>
  );
}
