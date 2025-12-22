import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CountdownTimer } from "@/components/HomePage/CountdownTimer";
import { 
  Vote, Users, BarChart3, FileText, Shield, BookOpen, Menu, BookOpenCheck, 
  Loader2, Sparkles, ChevronRight, HelpCircle, LogOut, GraduationCap, 
  Calendar, Star, Zap, ArrowRight, Home, UserPlus, Eye, Award, Newspaper
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { DualLogo, Logo, COHSSALogoImg } from "@/components/NavLink";
import { driver } from "driver.js";
import { supabase } from "@/integrations/supabase/client";
import { AuthGate } from "@/components/AuthGate";
import { toast } from "sonner";
import heroStudents from "@/assets/hero-students.jpg";
import "driver.js/dist/driver.css";

interface TimelineStage {
  id: string;
  stage_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_publicly_visible: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timelineStages, setTimelineStages] = useState<TimelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<TimelineStage | null>(null);
  const [nextStage, setNextStage] = useState<TimelineStage | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check if user has seen the tour
    const tourSeen = localStorage.getItem('iseco_tour_completed');
    setHasSeenTour(!!tourSeen);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, []);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    if (!loading && !hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, hasSeenTour]);

  const fetchTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('election_timeline')
        .select('*')
        .eq('is_publicly_visible', true)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setTimelineStages(data || []);
      
      const now = new Date();
      const active = data?.find(stage => {
        const start = new Date(stage.start_time);
        const end = new Date(stage.end_time);
        return stage.is_active && now >= start && now <= end;
      });
      
      setActiveStage(active || null);

      const upcoming = data?.find(stage => {
        const start = new Date(stage.start_time);
        return start > now;
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
      s.stage_name.toLowerCase().includes(stageName.toLowerCase())
    );
    if (!stage) return false;
    const start = new Date(stage.start_time);
    const end = new Date(stage.end_time);
    return stage.is_active && now >= start && now <= end;
  };

  const getCountdownTarget = (): { date: Date; title: string } | null => {
    if (activeStage) {
      return {
        date: new Date(activeStage.end_time),
        title: `${activeStage.stage_name} Ends In`
      };
    }
    if (nextStage) {
      return {
        date: new Date(nextStage.start_time),
        title: `${nextStage.stage_name} Begins In`
      };
    }
    return null;
  };

  const countdownData = getCountdownTarget();

  const features = [
    {
      icon: FileText,
      title: "Apply as Candidate",
      description: "Submit your application for student union positions",
      action: () => navigate("/aspirant/login"),
      visible: isStageActive("aspirant") || isStageActive("application"),
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: UserPlus,
      title: "Register as Voter",
      description: "Register to participate in the election",
      action: () => navigate("/voter/register"),
      visible: isStageActive("voter") || isStageActive("registration"),
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Vote,
      title: "Vote for Your Candidate",
      description: "Cast your vote for preferred candidates",
      action: () => navigate("/voter/login"),
      visible: isStageActive("voting"),
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: BarChart3,
      title: "View Live Results",
      description: "Monitor election progress in real-time",
      action: () => navigate("/results"),
      visible: isStageActive("results"),
      gradient: "from-orange-500/20 to-red-500/20",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const informationLinks = [
    { icon: Users, title: "Meet the Candidates", description: "View candidate profiles & manifestos", action: () => navigate("/candidates"), color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", hoverBg: "hover:bg-blue-500/20" },
    { icon: Shield, title: "Electoral Committee", description: "Meet the organizing team", action: () => navigate("/committee"), color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", hoverBg: "hover:bg-purple-500/20" },
    { icon: BookOpen, title: "Rules & Constitution", description: "Read election guidelines", action: () => navigate("/rules"), color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", hoverBg: "hover:bg-amber-500/20" },
    { icon: GraduationCap, title: "Student Portal", description: "Academic resources & mock tests", action: () => navigate("/portal"), color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", hoverBg: "hover:bg-cyan-500/20" },
    { icon: Newspaper, title: "Editorial", description: "News, articles & updates", action: () => navigate("/editorial"), color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", hoverBg: "hover:bg-rose-500/20" },
  ];

  const aboutLinks = [
    { icon: Award, title: "About COHSSA", description: "Learn about our association", action: () => navigate("/about/cohssa"), color: "bg-primary/10 text-primary" },
    { icon: GraduationCap, title: "About the College", description: "College of Health Sciences", action: () => navigate("/about/college"), color: "bg-accent/10 text-accent" },
    { icon: HelpCircle, title: "Support & Help", description: "Get assistance anytime", action: () => navigate("/support"), color: "bg-green-500/10 text-green-600" },
  ];

  const menuItems = [
    { label: "Home", icon: Home, action: () => { setIsMenuOpen(false); window.scrollTo(0, 0); }, alwaysShow: true },
    { label: "Apply as Candidate", icon: FileText, action: () => { setIsMenuOpen(false); navigate("/aspirant/login"); }, showWhen: () => isStageActive("aspirant") || isStageActive("application") },
    { label: "Register as Voter", icon: UserPlus, action: () => { setIsMenuOpen(false); navigate("/voter/register"); }, showWhen: () => isStageActive("voter") || isStageActive("registration") },
    { label: "Vote Now", icon: Vote, action: () => { setIsMenuOpen(false); navigate("/voter/login"); }, showWhen: () => isStageActive("voting") },
    { label: "View Results", icon: BarChart3, action: () => { setIsMenuOpen(false); navigate("/results"); }, showWhen: () => isStageActive("results") },
    { label: "View Candidates", icon: Users, action: () => { setIsMenuOpen(false); navigate("/candidates"); }, alwaysShow: true },
    { label: "Electoral Committee", icon: Shield, action: () => { setIsMenuOpen(false); navigate("/committee"); }, alwaysShow: true },
    { label: "About the College", icon: GraduationCap, action: () => { setIsMenuOpen(false); navigate("/about/college"); }, alwaysShow: true },
    { label: "About COHSSA", icon: Award, action: () => { setIsMenuOpen(false); navigate("/about/cohssa"); }, alwaysShow: true },
    { label: "Editorial", icon: Newspaper, action: () => { setIsMenuOpen(false); navigate("/editorial"); }, alwaysShow: true },
    { label: "Rules & Constitution", icon: BookOpen, action: () => { setIsMenuOpen(false); navigate("/rules"); }, alwaysShow: true },
    { label: "Student Portal", icon: GraduationCap, action: () => { setIsMenuOpen(false); navigate("/portal"); }, alwaysShow: true },
    { label: "Support & Help", icon: HelpCircle, action: () => { setIsMenuOpen(false); navigate("/support"); }, alwaysShow: true },
    { label: "Try Demo", icon: Eye, action: () => { setIsMenuOpen(false); navigate("/demo"); }, alwaysShow: true },
    { label: "Admin Access", icon: Shield, action: () => { setIsMenuOpen(false); navigate("/admin/login"); }, alwaysShow: true },
  ];

  const visibleMenuItems = menuItems.filter(item => item.alwaysShow || (item.showWhen && item.showWhen()));

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  const startTour = () => {
    setIsMenuOpen(false);
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      stagePadding: 4,
      popoverClass: 'driver-popover-theme',
      steps: [
        { 
          element: "#hero-section", 
          popover: { 
            title: "🎓 Welcome to ISECO!", 
            description: "The official Independent Students Electoral Committee platform for the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University.", 
            side: "bottom", 
            align: "center" 
          } 
        },
        { 
          element: "#dual-logos", 
          popover: { 
            title: "🏛️ Our Identity", 
            description: "ISECO manages elections for COHSSA - ensuring transparent, fair, and democratic student governance.", 
            side: "bottom", 
            align: "center" 
          } 
        },
        { 
          element: "#countdown-section", 
          popover: { 
            title: "⏱️ Election Timeline", 
            description: "This countdown shows the current or upcoming election stage. Stay updated on important deadlines for registration, applications, and voting!", 
            side: "bottom", 
            align: "center" 
          } 
        },
        { 
          element: "#action-cards", 
          popover: { 
            title: "🚀 Quick Actions", 
            description: "These cards appear based on active election stages - register as a voter, apply to be a candidate, cast your vote, or view results.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          element: "#info-section", 
          popover: { 
            title: "📚 Learn More", 
            description: "Access important information: view candidates, meet the electoral committee, read rules, access the student portal, or check the latest news.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          element: "#about-section", 
          popover: { 
            title: "ℹ️ About Us", 
            description: "Learn about COHSSA, the College of Health Sciences, and get support when you need it.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          element: "#admin-link", 
          popover: { 
            title: "🔐 Admin Access", 
            description: "Electoral committee members can access the admin panel to manage elections, review applications, and monitor voting.", 
            side: "top", 
            align: "center" 
          } 
        },
        { 
          popover: { 
            title: "✅ You're Ready!", 
            description: "You now know your way around ISECO. Participate actively in shaping your student government. Good luck!" 
          } 
        },
      ],
      onDestroyStarted: () => {
        localStorage.setItem('iseco_tour_completed', 'true');
        setHasSeenTour(true);
        if (driverObj.hasNextStep()) {
          const confirmed = confirm("Exit the tour?");
          if (!confirmed) return;
        }
        driverObj.destroy();
      },
    });
    driverObj.drive();
  };

  const visibleFeatures = features.filter(f => f.visible);

  const stats = [
    { icon: GraduationCap, label: "Active Students", value: "2,500+", color: "text-blue-500" },
    { icon: Vote, label: "Votes Cast", value: "10K+", color: "text-green-500" },
    { icon: Star, label: "Elections Held", value: "5", color: "text-amber-500" },
    { icon: Zap, label: "Instant Results", value: "24/7", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            id="dual-logos"
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <DualLogo logoSize="h-9 w-9" showLabels={true} />
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                  <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background/95 backdrop-blur-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <DualLogo logoSize="h-8 w-8" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-1">
                {visibleMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between group hover:bg-primary/10 transition-all duration-200"
                      onClick={item.action}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Button>
                  );
                })}
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2 hover:bg-primary/10" onClick={startTour}>
                    <BookOpenCheck className="h-4 w-4" />
                    Take a Tour
                  </Button>
                  {user && (
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section id="hero-section" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroStudents} 
            alt="College students" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="container relative mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Dual Logo Display */}
            <div className="flex justify-center gap-6 md:gap-10 animate-scale-in">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-primary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/20 transition-transform duration-300 hover:scale-105">
                  <Logo className="h-20 w-20 md:h-28 md:w-28" />
                  <p className="text-xs font-semibold text-primary mt-2">ISECO</p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-accent/30 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-4 bg-background/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-accent/20 transition-transform duration-300 hover:scale-105">
                  <COHSSALogoImg className="h-20 w-20 md:h-28 md:w-28" />
                  <p className="text-xs font-semibold text-accent mt-2">COHSSA</p>
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-accent animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent drop-shadow-sm">
                  ISECO
                </span>
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-foreground/90">
                Independent Students Electoral Committee
              </p>
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-lg md:text-xl text-foreground/80 font-medium">
                College of Health Sciences Students Association (COHSSA)
              </p>
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Al-Hikmah University, Ilorin, Nigeria
              </p>
            </div>

            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Your voice matters. Participate in transparent, fair, and democratic student elections.
            </p>

            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button 
                size="lg" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-primary text-primary-foreground animate-pulse-glow"
                onClick={() => document.getElementById('action-cards')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2"
                onClick={startTour}
              >
                <BookOpenCheck className="h-4 w-4" />
                Take a Tour
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-foreground/50 rounded-full animate-pulse" />
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

      {/* Action Cards Section */}
      <section id="action-cards" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">Take Action</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Participate in shaping your student government
          </p>
        </div>

        {visibleFeatures.length === 0 ? (
          <Card className="max-w-2xl mx-auto p-8 animate-fade-in shadow-lg border-dashed border-2">
            <CardContent className="space-y-6 text-center">
              <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-medium text-foreground mb-2">No active election activities</p>
                <p className="text-muted-foreground">Election stages will appear here when they become active.</p>
              </div>
              {timelineStages.length > 0 && (
                <div className="mt-6 p-6 bg-muted/50 rounded-xl">
                  <h4 className="font-semibold mb-4 text-foreground flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Stages
                  </h4>
                  <div className="space-y-3">
                    {timelineStages.slice(0, 3).map((stage) => (
                      <div key={stage.id} className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/50">
                        <span className="font-medium">{stage.stage_name}</span>
                        <span className="text-sm text-muted-foreground">{new Date(stage.start_time).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${visibleFeatures.length <= 2 ? 'lg:grid-cols-2 max-w-3xl' : 'lg:grid-cols-4 max-w-7xl'} gap-6 mx-auto`}>
            {visibleFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={feature.action}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardContent className="p-8 text-center space-y-6 relative">
                    <div className="flex justify-center">
                      <div className={`h-20 w-20 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <Icon className={`h-10 w-10 ${feature.iconColor}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                    <Button className="w-full gap-2 transition-all" variant="secondary">
                      Get Started
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Information Links Section */}
      <section id="info-section" className="container mx-auto px-4 py-16 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">Learn More</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Everything you need to know about the election process
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {informationLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.title}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up overflow-hidden ${link.hoverBg}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={link.action}
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className={`w-14 h-14 rounded-xl ${link.color} flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">About Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Learn more about our organization and get support
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {aboutLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.title}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={link.action}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl ${link.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                  <Button variant="ghost" className="gap-1 text-sm">
                    Learn more <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

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

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <DualLogo logoSize="h-8 w-8" />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2025 Independent Students Electoral Committee</p>
              <p className="mt-1 flex items-center justify-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Al-Hikmah University, Ilorin, Nigeria
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/support")} className="text-xs">Support</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/rules")} className="text-xs">Rules</Button>
              <Button variant="ghost" size="sm" onClick={startTour} className="text-xs gap-1">
                <BookOpenCheck className="h-3 w-3" /> Tour
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const IndexWithAuth = () => (
  <AuthGate>
    <Index />
  </AuthGate>
);

export default IndexWithAuth;
