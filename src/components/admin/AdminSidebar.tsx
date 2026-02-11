import { LayoutDashboard, Users, Radio, CreditCard, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const views = [
  { id: "overview" as const, title: "Overview", icon: LayoutDashboard },
  { id: "students" as const, title: "Student Registry", icon: Users },
  { id: "operations" as const, title: "Live Operations", icon: Radio },
  { id: "subscriptions" as const, title: "Subscriptions", icon: CreditCard },
  { id: "access" as const, title: "Access Control", icon: Shield },
];

type AdminView = "overview" | "students" | "operations" | "subscriptions" | "access";

interface AdminSidebarProps {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {views.map((view) => (
                <SidebarMenuItem key={view.id}>
                  <SidebarMenuButton
                    isActive={activeView === view.id}
                    onClick={() => onViewChange(view.id)}
                    tooltip={view.title}
                  >
                    <view.icon className="h-4 w-4" />
                    <span>{view.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
