import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Vote,
  Settings,
  Calendar,
  BarChart3,
  LogOut,
  Menu,
  BookOpen,
  Activity,
  Crown,
  GraduationCap,
  BookMarked,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

interface AdminLayoutProps {
  children: ReactNode;
  onStartTour?: () => void;
}

const electionMenuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    url: "/admin/dashboard",
    color: "text-primary",
  },
  {
    title: "Student List",
    icon: Users,
    url: "/admin/students",
    color: "text-blue-600",
  },
  {
    title: "Voter Management",
    icon: Vote,
    url: "/admin/voters",
    color: "text-cyan-600",
  },
  {
    title: "Aspirant Review",
    icon: FileText,
    url: "/admin/aspirants",
    color: "text-purple-600",
  },
  {
    title: "Candidates",
    icon: Vote,
    url: "/admin/candidates",
    color: "text-green-600",
  },
  {
    title: "Positions",
    icon: Settings,
    url: "/admin/positions",
    color: "text-orange-600",
  },
  {
    title: "Timeline",
    icon: Calendar,
    url: "/admin/timeline",
    color: "text-indigo-600",
  },
  {
    title: "Live Control",
    icon: BarChart3,
    url: "/admin/live-control",
    color: "text-red-600",
  },
  {
    title: "Activity Log",
    icon: Activity,
    url: "/admin/activity",
    color: "text-amber-600",
  },
];

const contentMenuItems = [
  {
    title: "Content Management",
    icon: Crown,
    url: "/admin/content",
    color: "text-pink-600",
  },
  {
    title: "Academic Resources",
    icon: BookMarked,
    url: "/admin/resources",
    color: "text-teal-600",
  },
  {
    title: "Textbook Marketplace",
    icon: BookOpen,
    url: "/admin/textbooks",
    color: "text-emerald-600",
  },
  {
    title: "Events & Gallery",
    icon: Image,
    url: "/admin/events",
    color: "text-violet-600",
  },
];

function AdminSidebar({ onStartTour }: { onStartTour?: () => void }) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4 border-b">
          <Logo className={collapsed ? "h-8 w-8" : "h-12 w-12"} />
          {!collapsed && (
            <h2 className="mt-2 font-bold text-lg">Admin Panel</h2>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Elections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {electionMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted/50 transition-colors"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Portal Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-muted/50 transition-colors"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t space-y-2">
          {onStartTour && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onStartTour}
              id="tour-trigger"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {!collapsed && "Start Tour"}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children, onStartTour }: AdminLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar onStartTour={onStartTour} />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold">ISECO Electoral System</h1>
          </header>
          <main className="flex-1 overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
