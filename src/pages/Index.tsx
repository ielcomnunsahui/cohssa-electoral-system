import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CountdownTimer } from "@/components/HomePage/CountdownTimer";
import { 
  Vote, School, Zap, Users, BarChart3, FileText, Shield, BookOpen, Menu, BookOpenCheck, 
  Loader2, Sparkles, ChevronRight, HelpCircle, LogOut, GraduationCap, 
  Calendar, ArrowRight, Home, UserPlus, Eye, Award, Newspaper, LogIn, User,
  ExternalLink, Library, ChevronDown
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate, Link } from "react-router-dom";
import { DualLogo, Logo, COHSSALogoImg } from "@/components/NavLink";
import { driver } from "driver.js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import heroStudents from "@/assets/hero-students-group.jpg";
import "driver.js/dist/driver.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface TimelineStage {
  id: string;
  title?: string | null;
  description?: string | null;
  stage_name: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_active: boolean;
  is_publicly_visible: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, openAuthDialog, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timelineStages, setTimelineStages] = useState<TimelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<TimelineStage | null>(null);
  const [nextStage, setNextStage] = useState<TimelineStage | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        setIsAdmin(!!data && !error);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [user]);

  const getStageStart = (stage: TimelineStage): Date | null => {
    const raw = stage.start_date ?? stage.start_time ?? null;
    return raw ? new Date(raw) : null;
  };

  const getStageEnd = (stage: TimelineStage): Date | null => {
    const raw = stage.end_date ?? stage.end_time ?? null;
    return raw ? new Date(raw) : null;
  };

  useEffect(() => {
    const tourSeen = localStorage.getItem('iseco_tour_completed');
    setHasSeenTour(!!tourSeen);
  }, []);

  useEffect(() => {
    fetchTimeline();

    const channel = supabase
      .channel('election-timeline-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'election_timeline'
        },
        () => fetchTimeline()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!loading && !hasSeenTour) {
      const timer = setTimeout(() => startTour(), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTour]);

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('election_timeline')
        .select('*')
        .eq('is_publicly_visible', true)
        .order('start_date', { ascending: true });

      if (error) throw error;

      const stages = (data || []) as TimelineStage[];
      setTimelineStages(stages);

      const now = new Date();
      const active = stages.find((stage) => {
        if (!stage.is_active) return false;
        const start = getStageStart(stage);
        const end = getStageEnd(stage);
        if (!start) return false;
        if (now < start) return false;
        if (end && now > end) return false;
        return true;
      });

      setActiveStage(active || null);

      const upcoming = stages.find((stage) => {
        const start = getStageStart(stage);
        return start ? start > now : false;
      });

      setNextStage(upcoming || null);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const isStageActive = (stageName: string): boolean => {
    const now = new Date();
    const stage = timelineStages.find(s =>
      (s.stage_name || '').toLowerCase().includes(stageName.toLowerCase())
    );
    if (!stage) return false;

    const start = getStageStart(stage);
    const end = getStageEnd(stage);

    if (!stage.is_active) return false;
    if (!start) return false;
    if (now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const getCountdownTarget = (): { date: Date; title: string } | null => {
    if (activeStage) {
      const end = getStageEnd(activeStage);
      if (end) {
        return { date: end, title: `${activeStage.stage_name || 'Stage'} Ends In` };
      }
    }
    if (nextStage) {
      const start = getStageStart(nextStage);
      if (start) {
        return { date: start, title: `${nextStage.stage_name || 'Stage'} Begins In` };
      }
    }
    return null;
  };

  const countdownData = getCountdownTarget();

  const actionCards = [
    {
      icon: User,
      title: "Aspirant Dashboard",
      description: "Check your application status",
      action: () => navigate("/aspirant/dashboard"),
      visible: !!user,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: "Apply as Candidate",
      description: "Submit your candidacy application",
      action: () => navigate("/aspirant/login"),
      visible: isStageActive("aspirant") || isStageActive("application"),
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: UserPlus,
      title: "Register as Voter",
      description: "Register to participate",
      action: () => navigate("/voter/register"),
      visible: isStageActive("voter") || isStageActive("registration"),
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: Vote,
      title: "Cast Your Vote",
      description: "Vote for your candidates",
      action: () => navigate("/voter/login"),
      visible: isStageActive("voting"),
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: BarChart3,
      title: "View Results",
      description: "See live election results",
      action: () => navigate("/results"),
      visible: isStageActive("results"),
      color: "bg-orange-500/10 text-orange-600",
    }
  ];

  const quickLinks = [
    { icon: Users, title: "Candidates", action: () => navigate("/candidates") },
    { icon: Shield, title: "Committee", action: () => navigate("/committee") },
    { icon: BookOpen, title: "Rules", action: () => navigate("/rules") },
    { icon: Newspaper, title: "Editorial", action: () => navigate("/editorial") },
  ];

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    toast.success("Signed out successfully");
  };

  const handleSignIn = () => {
    setIsMenuOpen(false);
    openAuthDialog();
  };

  const startTour = () => {
    setIsMenuOpen(false);
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.75)',
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: 'driver-popover-theme',
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Finish Tour',
      steps: [
        { 
          element: "#hero-section", 
          popover: { 
            title: "🎓 Welcome to COHSSA Electoral System!", 
            description: "This is the official election platform for the College of Health Sciences Students Association at Al-Hikmah University.", 
            side: "bottom", 
            align: "center" 
          } 
        },
        { 
          element: "#nav-actions", 
          popover: { 
            title: "🚀 Quick Navigation", 
            description: "Access election actions, portals, and information from these grouped menus. Everything is organized for easy access.", 
            side: "bottom", 
            align: "center" 
          } 
        },
        { 
          element: "#countdown-section", 
          popover: { 
            title: "⏱️ Election Timeline", 
            description: "Track election stages in real-time. See when voter registration opens, application deadlines, and voting periods.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          element: "#action-cards", 
          popover: { 
            title: "🗳️ Take Action", 
            description: "These cards appear based on what's currently open: apply as candidate, register to vote, cast your ballot, or view results!", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          element: "#quick-links", 
          popover: { 
            title: "📚 Quick Links", 
            description: "View candidates, meet the electoral committee, read rules, and access news updates.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          popover: { 
            title: "✅ You're Ready!", 
            description: "You now know how to navigate the COHSSA Electoral System. Your voice matters - participate in shaping student governance!" 
          } 
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem('iseco_tour_completed', 'true');
        setHasSeenTour(true);
        if (driverObj.hasNextStep()) {
          const confirmed = confirm("Are you sure you want to exit the tour?");
          if (!confirmed) return;
        }
        driverObj.destroy();
      },
    });
    driverObj.drive();
  };

  const visibleActions = actionCards.filter(f => f.visible);
  const stats = [
    { icon: Users, label: "Active Students", value: "1,350+", color: "text-blue-500" },
    { icon: School, label: "Faculties", value: "2", color: "text-green-500" },
    { icon: GraduationCap, label: "Departments", value: "7", color: "text-amber-500" },
    { icon: Zap, label: "Instant Results", value: "24/7", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Simplified Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              id="dual-logos"
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <DualLogo logoSize="h-8 w-8" showLabels={false} />
              <span className="font-bold text-lg hidden sm:block">COHSSA</span>
            </div>
            
            {/* Desktop Nav - Grouped */}
            <nav id="nav-actions" className="hidden md:flex items-center gap-2">
              {/* Election Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    Election <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/candidates")}>
                    <Users className="h-4 w-4 mr-2" /> Candidates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/committee")}>
                    <Shield className="h-4 w-4 mr-2" /> Committee
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/results")}>
                    <BarChart3 className="h-4 w-4 mr-2" /> Results
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/rules")}>
                    <BookOpen className="h-4 w-4 mr-2" /> Rules
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Portals Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    Portals <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {user && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">My Account</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate("/aspirant/dashboard")}>
                        <User className="h-4 w-4 mr-2" /> Aspirant Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">COHSSA</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/cohssa-portal")}>
                    <GraduationCap className="h-4 w-4 mr-2" /> COHSSA Portal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/editorial")}>
                    <Newspaper className="h-4 w-4 mr-2" /> Editorial
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">University</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/portal")}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Student Portal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* About Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    About <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/about/cohssa")}>
                    <Award className="h-4 w-4 mr-2" /> About COHSSA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/about/college")}>
                    <GraduationCap className="h-4 w-4 mr-2" /> The College
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/support")}>
                    <HelpCircle className="h-4 w-4 mr-2" /> Support
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={() => navigate("/demo")}>
                <Eye className="h-4 w-4 mr-1" /> Demo
              </Button>

              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/dashboard")} className="gap-1 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-4 w-4" /> Admin
                </Button>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="hidden sm:flex gap-2"
                  onClick={handleSignIn}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )}
              <ThemeToggle />
              
              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <DualLogo logoSize="h-8 w-8" />
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-1">
                    {user && (
                      <div className="p-3 mb-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.user_metadata?.full_name || 'Welcome!'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {user && (
                      <>
                        <p className="text-xs font-medium text-muted-foreground px-3 pt-2">MY ACCOUNT</p>
                        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/aspirant/dashboard"); }}>
                          <User className="h-4 w-4" /> Aspirant Dashboard
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" className="w-full justify-start gap-2 text-primary" onClick={() => { setIsMenuOpen(false); navigate("/admin/dashboard"); }}>
                            <Shield className="h-4 w-4" /> Admin Dashboard
                          </Button>
                        )}
                      </>
                    )}
                    
                    <p className="text-xs font-medium text-muted-foreground px-3 pt-2">ELECTION</p>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/candidates"); }}>
                      <Users className="h-4 w-4" /> Candidates
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/committee"); }}>
                      <Shield className="h-4 w-4" /> Committee
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/results"); }}>
                      <BarChart3 className="h-4 w-4" /> Results
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/rules"); }}>
                      <BookOpen className="h-4 w-4" /> Rules
                    </Button>
                    
                    <p className="text-xs font-medium text-muted-foreground px-3 pt-4">PORTALS</p>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/cohssa-portal"); }}>
                      <GraduationCap className="h-4 w-4" /> COHSSA Portal
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/portal"); }}>
                      <ExternalLink className="h-4 w-4" /> Student Portal
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/editorial"); }}>
                      <Newspaper className="h-4 w-4" /> Editorial
                    </Button>
                    
                    <p className="text-xs font-medium text-muted-foreground px-3 pt-4">ABOUT</p>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/about/cohssa"); }}>
                      <Award className="h-4 w-4" /> About COHSSA
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/about/college"); }}>
                      <GraduationCap className="h-4 w-4" /> The College
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/support"); }}>
                      <HelpCircle className="h-4 w-4" /> Support
                    </Button>
                    
                    <div className="pt-4 border-t space-y-2">
                      <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setIsMenuOpen(false); navigate("/demo"); }}>
                        <Eye className="h-4 w-4" /> Demo
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={startTour}>
                        <BookOpenCheck className="h-4 w-4" /> Take Tour
                      </Button>
                      {user ? (
                        <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleSignOut}>
                          <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                      ) : (
                        <Button className="w-full justify-start gap-2" onClick={handleSignIn}>
                          <LogIn className="h-4 w-4" /> Sign In
                        </Button>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Simplified */}
      <section id="hero-section" className="relative min-h-[80vh] flex items-center justify-center pt-20 pb-12 overflow-hidden">
       {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroStudents} 
            alt="College students" 
            className="w-full h-full object-cover"
          />
          {/* Primary gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/95" />
          {/* Secondary subtle color accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-accent/15" />
          {/* Dark vignette effect for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)/0.4)_100%)]" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            {/* Logos */}
            <div className="flex justify-center gap-4 animate-fade-in">
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/20">
                <Logo className="h-16 w-16 md:h-20 md:w-20" />
              </div>
              <div className="p-3 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-accent/20 relative">
                <COHSSALogoImg className="h-16 w-16 md:h-20 md:w-20" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-accent animate-pulse" />
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="text-sm font-medium text-primary uppercase tracking-widest">Welcome to</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  COHSSA Electoral System
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                College of Health Sciences Students Association
              </p>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Al-Hikmah University, Ilorin
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="gap-2 shadow-lg"
                onClick={() => document.getElementById('action-cards')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2"
                onClick={startTour}
              >
                <BookOpenCheck className="h-4 w-4" />
                Take Tour
              </Button>
            </div>
          </div>
        </div>
      </section>

       {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className="text-center p-4 rounded-xl hover:bg-background/50 transition-all duration-300 animate-slide-up group cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl ${stat.color} bg-current/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section id="countdown-section" className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto shadow-2xl border-primary/10 overflow-hidden animate-fade-in relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500" />
          <CardContent className="p-8 md:p-12 relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading election timeline...</p>
              </div>
            ) : countdownData ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Election Timeline</span>
                </div>
                <CountdownTimer targetDate={countdownData.date} title={countdownData.title} />
                
                {/* Timeline Stages Overview */}
                {timelineStages.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">Election Stages</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {timelineStages.map((stage) => {
                        const now = new Date();
                        const start = getStageStart(stage);
                        const end = getStageEnd(stage);

                        const isActive = !!start && stage.is_active && now >= start && (!end || now <= end);
                        const isPast = !!end && now > end;
                        const isUpcoming = !!start && now < start;

                        return (
                          <div 
                            key={stage.id} 
                            className={`p-3 rounded-lg border transition-all ${
                              isActive 
                                ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                : isPast 
                                  ? 'bg-muted/30 border-muted' 
                                  : 'bg-background border-border/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-medium text-sm ${isActive ? 'text-primary' : isPast ? 'text-muted-foreground' : 'text-foreground'}`}> 
                                {(stage.stage_name || stage.title || 'Stage')}
                              </span>
                              {isActive && (
                                <span className="flex items-center gap-1 text-xs text-primary">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                  Live
                                </span>
                              )}
                              {isPast && <span className="text-xs text-muted-foreground">Completed</span>}
                              {isUpcoming && <span className="text-xs text-muted-foreground">Upcoming</span>}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {start ? start.toLocaleDateString() : '-'}{end ? ` - ${end.toLocaleDateString()}` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-xl text-foreground font-medium">No active election stage</p>
                <p className="text-muted-foreground">Check back later for updates on upcoming elections.</p>
              </div>
            )}
            
            {activeStage && (
              <div className="mt-8 text-center">
                <span className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 shadow-sm animate-pulse-glow">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full mr-3 animate-pulse" />
                  {activeStage.stage_name} is Active
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      {/* Action Cards */}
      <section id="action-cards" className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Take Action</h2>
          <p className="text-muted-foreground">Participate in shaping your student government</p>
        </div>

        {visibleActions.length === 0 ? (
          <Card className="max-w-lg mx-auto p-6 border-dashed border-2 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-2">No active election activities</p>
            <p className="text-sm text-muted-foreground">Actions will appear when stages become active</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {visibleActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={action.title}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={action.action}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      

      {/* Quick Links */}
      <section id="quick-links" className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Quick Links</h2>
          <p className="text-muted-foreground">Access important information</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.title}
                variant="outline"
                className="gap-2 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={link.action}
              >
                <Icon className="h-4 w-4" />
                {link.title}
              </Button>
            );
          })}
          <Button
            variant="outline"
            className="gap-2 animate-fade-in"
            style={{ animationDelay: '200ms' }}
            onClick={() => navigate("/cohssa-portal")}
          >
            <Library className="h-4 w-4" />
            COHSSA Portal
          </Button>
          <Button
            variant="outline"
            className="gap-2 animate-fade-in"
            style={{ animationDelay: '250ms' }}
            onClick={() => navigate("/portal")}
          >
            <ExternalLink className="h-4 w-4" />
            Student Portal
          </Button>
        </div>
        {/* Demo & Admin Links */}
      <section id="admin-link" className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <Card className="max-w-md mx-auto p-6 border-dashed border-2 hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate("/demo")}>
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:scale-110 transition-transform">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Try Interactive Demo</p>
                <p className="text-xs text-muted-foreground">Experience the system in a sandbox</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/login")}
            className="text-muted-foreground hover:text-primary gap-2 hover:bg-primary/5 transition-all"
          >
            <Shield className="h-4 w-4" />
            Admin Access
          </Button>
        </div>
      </section>
      </section>

      

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DualLogo logoSize="h-7 w-7" />
              <span className="text-sm text-muted-foreground">ISECO × COHSSA</span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} College of Health Sciences Students Association</p>
              <p className="text-xs mt-1">Al-Hikmah University, Ilorin</p>
            </div>
            <div className="flex gap-2">
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <span className="text-muted-foreground/30">•</span>
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <span className="text-muted-foreground/30">•</span>
              <button onClick={startTour} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Tour
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
