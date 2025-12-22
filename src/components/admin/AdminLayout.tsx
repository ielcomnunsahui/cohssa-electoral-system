import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Vote,
  Settings,
  Calendar,
  BarChart3,
  LogOut,
  BookOpen,
  Activity,
  Crown,
  GraduationCap,
  BookMarked,
  Image,
  Home,
  ChevronRight,
  Bell,
  Search,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DualLogo, Logo } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    badge: null,
  },
  {
    title: "Student List",
    icon: Users,
    url: "/admin/students",
    color: "text-blue-500",
    badge: null,
  },
  {
    title: "Voter Management",
    icon: Vote,
    url: "/admin/voters",
    color: "text-cyan-500",
    badge: null,
  },
  {
    title: "Aspirant Review",
    icon: FileText,
    url: "/admin/aspirants",
    color: "text-purple-500",
    badge: "pending",
  },
  {
    title: "Candidates",
    icon: Vote,
    url: "/admin/candidates",
    color: "text-green-500",
    badge: null,
  },
  {
    title: "Positions",
    icon: Settings,
    url: "/admin/positions",
    color: "text-orange-500",
    badge: null,
  },
  {
    title: "Timeline",
    icon: Calendar,
    url: "/admin/timeline",
    color: "text-indigo-500",
    badge: null,
  },
  {
    title: "Live Control",
    icon: Activity,
    url: "/admin/live-control",
    color: "text-red-500",
    badge: "live",
  },
  {
    title: "Activity Log",
    icon: Activity,
    url: "/admin/activity",
    color: "text-amber-500",
    badge: null,
  },
];

const contentMenuItems = [
  {
    title: "Content Management",
    icon: Crown,
    url: "/admin/content",
    color: "text-pink-500",
    badge: null,
  },
  {
    title: "Editorial Review",
    icon: Newspaper,
    url: "/admin/editorial",
    color: "text-rose-500",
    badge: "review",
  },
  {
    title: "Academic Resources",
    icon: BookMarked,
    url: "/admin/resources",
    color: "text-teal-500",
    badge: null,
  },
  {
    title: "Textbook Marketplace",
    icon: BookOpen,
    url: "/admin/textbooks",
    color: "text-emerald-500",
    badge: null,
  },
  {
    title: "Events & Gallery",
    icon: Image,
    url: "/admin/events",
    color: "text-violet-500",
    badge: null,
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

  const renderMenuItem = (item: typeof electionMenuItems[0]) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.url;
    
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "hover:bg-primary/10 hover:translate-x-1",
              isActive && "bg-primary/15 text-primary font-medium shadow-sm"
            )}
            activeClassName="bg-primary/15 text-primary font-medium"
          >
            <Icon className={cn("h-5 w-5 transition-colors", item.color, isActive && "text-primary")} />
            {!collapsed && (
              <>
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === "live" ? "destructive" : "secondary"} 
                    className={cn(
                      "text-xs h-5",
                      item.badge === "live" && "animate-pulse"
                    )}
                  >
                    {item.badge === "live" ? "●" : item.badge === "pending" ? "!" : "●"}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar 
      className={cn(collapsed ? "w-16" : "w-64", "border-r border-border/50")} 
      collapsible="icon"
      data-tour="sidebar"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo Section */}
        <div className="p-4 border-b border-border/50">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            {collapsed ? (
              <Logo className="h-8 w-8" />
            ) : (
              <DualLogo logoSize="h-8 w-8" showLabels={false} />
            )}
          </div>
          {!collapsed && (
            <div className="mt-3">
              <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">ISECO Electoral System</p>
            </div>
          )}
        </div>

        {/* Election Management Group */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
            {!collapsed && "Elections"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {electionMenuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management Group */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
            {!collapsed && "Portal Content"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {contentMenuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="mt-auto p-3 border-t border-border/50 space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10",
              collapsed && "justify-center px-0"
            )}
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            {!collapsed && "Back to Home"}
          </Button>
          {onStartTour && (
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 border-primary/30 hover:bg-primary/10",
                collapsed && "justify-center px-0"
              )}
              onClick={onStartTour}
              id="tour-trigger"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              {!collapsed && "Start Tour"}
            </Button>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 text-destructive hover:bg-destructive/10",
              collapsed && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout({ children, onStartTour }: AdminLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar onStartTour={onStartTour} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4 hover:bg-primary/10 transition-colors" />
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 ml-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              </Button>
              <div className="h-8 w-px bg-border mx-2" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Admin</p>
                  <p className="text-xs text-muted-foreground">Electoral Committee</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
