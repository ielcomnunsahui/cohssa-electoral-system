import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, CheckCircle, User, Award, Lock, LogOut, Briefcase, Sparkles, ChevronRight, XCircle, AlertCircle, GraduationCap, Phone, Mail, Calendar, MapPin, Users, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";
import DualLogo from "@/components/DualLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateApplicationPrintHTML } from "@/components/aspirant/ApplicationPrintTemplate";

const AspirantDashboard = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/aspirant/login");
        return;
      }
      
      setUserEmail(user.email || "");
      setUserId(user.id);

      const [appResult, positionsResult] = await Promise.all([
        supabase
          .from("aspirants")
          // NOTE: do not attempt embedding positions(*) here because the DB doesn't
          // have a FK relationship; PostgREST will error and return null data.
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("positions")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .order("title"),
      ]);

      if (positionsResult.error) {
        console.error("Error loading positions:", positionsResult.error);
      } else if (positionsResult.data) {
        setPositions(positionsResult.data);
      }

      if (appResult.error) {
        console.error("Error loading application:", appResult.error);
        toast.error("Could not load your application. Please refresh.");
        setApplication(null);
      } else {
        const app = appResult.data;
        const pos = app?.position_id && positionsResult.data
          ? positionsResult.data.find((p: any) => p.id === app.position_id)
          : null;

        setApplication(
          app
            ? {
                ...app,
                // keep backward compatibility with existing UI usage
                positions: pos,
              }
            : null
        );
      }
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription for application updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('aspirant-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aspirants',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            // Reload data to get fresh position details
            loadData();
            toast.info("Application data updated");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadData]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDownloadApplicationPdf = () => {
    if (!application) return;

    const stepData = (application.step_data as any) || {};
    const personal = stepData.personal || {};
    const position = stepData.position || {};
    const academic = stepData.academic || {};
    const leadership = stepData.leadership || {};

    const htmlContent = generateApplicationPrintHTML({
      full_name: application.full_name || personal.full_name || "",
      matric_number: application.matric_number || personal.matric || "",
      department: application.department || personal.department || "",
      level: application.level || personal.level || "",
      email: application.email || userEmail || "",
      phone: application.phone || personal.phone || "",
      gender: application.gender || personal.gender || "",
      date_of_birth: application.date_of_birth || personal.date_of_birth || "",
      position_title: application.positions?.title || position.position_details?.title || position.position_details?.position_name || "",
      why_running: application.why_running || position.why_running || "",
      cgpa: application.cgpa ?? academic.cgpa ?? "",
      leadership_history: application.leadership_history || leadership.leadership_history || leadership.experience || "",
      submitted_at: application.submitted_at || undefined,
      status: application.status || undefined,
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups to download the PDF.");
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const statuses = ['pending', 'submitted', 'under_review', 'approved', 'rejected'];
  
  const getStatusInfo = () => {
    if (!application) return { text: "Not Started", color: "text-muted-foreground", bgColor: "bg-muted", icon: Clock, description: "Start your application", progress: 0 };
    
    const currentIdx = statuses.indexOf(application.status);
    const progress = ((currentIdx + 1) / statuses.length) * 100;

    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: any; description: string; progress: number }> = {
      pending: { text: "Draft", color: "text-amber-600", bgColor: "bg-amber-500/10", icon: Clock, description: "Continue your application", progress: 20 },
      submitted: { text: "Submitted", color: "text-blue-600", bgColor: "bg-blue-500/10", icon: FileText, description: "Awaiting review", progress: 40 },
      under_review: { text: "Under Review", color: "text-purple-600", bgColor: "bg-purple-500/10", icon: AlertCircle, description: "Admin is reviewing your application", progress: 60 },
      approved: { text: "Approved", color: "text-green-600", bgColor: "bg-green-500/10", icon: CheckCircle, description: "Congratulations! Your application has been approved", progress: 100 },
      rejected: { text: "Rejected", color: "text-red-600", bgColor: "bg-red-500/10", icon: XCircle, description: "Your application was not successful", progress: 0 },
    };

    return statusMap[application.status] || { text: "Unknown", color: "text-muted-foreground", bgColor: "bg-muted", icon: Clock, description: "", progress: 0 };
  };

  // Calculate last incomplete step for resume banner
  const getLastIncompleteStep = () => {
    if (!application || !application.step_data) return { step: 1, name: "Personal Info" };
    
    const stepData = application.step_data as any;
    const steps = [
      { key: 'personal', num: 1, name: 'Personal Info', check: (d: any) => d?.full_name && d?.matric && d?.department },
      { key: 'position', num: 2, name: 'Position', check: (d: any) => d?.position_id },
      { key: 'academic', num: 3, name: 'Academic', check: (d: any) => d?.cgpa },
      { key: 'leadership', num: 4, name: 'Leadership', check: (d: any) => d?.leadership_history?.length > 50 },
      { key: 'referee', num: 5, name: 'Referee', check: () => true }, // Optional step
      { key: 'payment', num: 6, name: 'Payment', check: (d: any) => d?.payment_proof_url },
    ];
    
    for (const step of steps) {
      if (!step.check(stepData[step.key])) {
        return { step: step.num, name: step.name };
      }
    }
    return { step: 7, name: 'Review & Submit' };
  };

  const hasExistingApplication = !!application;
  const hasSubmittedApplication = application && ['submitted', 'under_review', 'approved', 'rejected'].includes(application.status);
  const isPendingApplication = application && application.status === 'pending';
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const lastIncompleteStep = isPendingApplication ? getLastIncompleteStep() : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title="Aspirant Dashboard" 
        description="Manage your COHSSA election aspirant application. Track status, view positions, and complete your application."
      />
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
          <DualLogo size="sm" />
          <Button variant="outline" onClick={handleLogout} className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="container relative mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 animate-fade-in">
          <div className="relative group">
            {application?.photo_url || (application?.step_data as any)?.personal?.photo_url ? (
              <img 
                src={application.photo_url || (application.step_data as any)?.personal?.photo_url} 
                alt="Profile" 
                className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-xl group-hover:border-primary/40 transition-colors"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20 shadow-xl">
                <User className="w-14 h-14 text-muted-foreground" />
              </div>
            )}
            {application?.status === 'approved' && (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {application?.full_name || (application?.step_data as any)?.personal?.full_name || "Welcome, Aspirant!"}
            </h1>
            <p className="text-muted-foreground mt-1">{userEmail}</p>
            {application && (
              <Badge className={`mt-2 ${statusInfo.bgColor} ${statusInfo.color} border-0`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.text}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Application Status Card */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardHeader className="relative bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                    <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                  </div>
                  Application Status
                </CardTitle>
                <CardDescription>Track your application progress</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6 pt-6">
                {/* Status Banner */}
                <div className={`p-5 rounded-2xl border-2 ${statusInfo.bgColor} border-current/10`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-background shadow-sm`}>
                      <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-2xl ${statusInfo.color}`}>{statusInfo.text}</p>
                      <p className="text-sm text-muted-foreground mt-1">{statusInfo.description}</p>
                    </div>
                  </div>
                  {application && application.status !== 'rejected' && (
                    <div className="mt-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{Math.round(statusInfo.progress)}%</span>
                      </div>
                      <Progress value={statusInfo.progress} className="h-3 rounded-full" />
                    </div>
                  )}
                </div>

                {application && (
                  <>
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <span className="text-xs text-muted-foreground block mb-1">Position</span>
                        <p className="font-semibold">{application.positions?.title || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <span className="text-xs text-muted-foreground block mb-1">Submitted</span>
                        <p className="font-semibold">
                          {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Not yet'}
                        </p>
                      </div>
                      {application.payment_proof_url && (
                        <div className="p-4 bg-green-500/10 rounded-xl col-span-2">
                          <span className="text-xs text-muted-foreground block mb-1">Payment Status</span>
                          <Badge className="bg-green-500/20 text-green-600 border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Payment Proof Uploaded
                          </Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Resume Banner for pending applications */}
                {isPendingApplication && lastIncompleteStep && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <PlayCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Resume where you left off</p>
                        <p className="text-xs text-muted-foreground">Continue at: <span className="text-primary font-medium">{lastIncompleteStep.name}</span></p>
                      </div>
                      <Button 
                        size="sm" 
                        className="gap-1"
                        onClick={() => navigate(`/aspirant/apply?step=${lastIncompleteStep.step}`)}
                      >
                        Resume
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!hasSubmittedApplication && (
                  <Button 
                    className="w-full gap-2 group h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
                    onClick={() => navigate("/aspirant/apply")}
                  >
                    <FileText className="h-5 w-5" />
                    {application ? "Continue Application" : "Start New Application"}
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Info Card */}
          <Card className="animate-fade-in h-fit border-0 shadow-lg" style={{ animationDelay: '200ms' }}>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {application ? (
                <>
                  <div className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="text-xs text-muted-foreground block mb-1">Matric</span>
                    <p className="font-mono font-semibold text-lg">{application.matric_number || (application.step_data as any)?.personal?.matric || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="text-xs text-muted-foreground block mb-1">Department</span>
                    <p className="font-semibold text-sm">{application.department || (application.step_data as any)?.personal?.department || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="text-xs text-muted-foreground block mb-1">Level</span>
                    <p className="font-semibold">{application.level || (application.step_data as any)?.personal?.level || 'N/A'}</p>
                  </div>
                  {(application.cgpa && application.cgpa > 0) || (application.step_data as any)?.academic?.cgpa ? (
                    <div className="p-4 bg-primary/10 rounded-xl">
                      <span className="text-xs text-muted-foreground block mb-1">CGPA</span>
                      <p className="font-bold text-2xl text-primary">{(application.cgpa || (application.step_data as any)?.academic?.cgpa)?.toFixed(2)}</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Start your application to see your info here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application Progress Tracker - Show only for submitted applications */}
        {hasSubmittedApplication && (
          <Card className="mt-6 animate-fade-in border-0 shadow-lg" style={{ animationDelay: '300ms' }}>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Application Progress
              </CardTitle>
              <CardDescription>Track your application through the review process</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative">
                {/* Progress Steps */}
                <div className="flex justify-between mb-4">
                  {['Submitted', 'Under Review', 'Decision'].map((step, index) => {
                    const stepStatuses = [['submitted'], ['under_review'], ['approved', 'rejected']];
                    const isActive = stepStatuses[index].includes(application?.status);
                    const isPast = index === 0 ? true : 
                                   index === 1 ? ['under_review', 'approved', 'rejected'].includes(application?.status) :
                                   ['approved', 'rejected'].includes(application?.status);
                    
                    return (
                      <div key={step} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                          isPast ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground'
                        } ${isActive ? 'ring-4 ring-primary/30 scale-110' : ''}`}>
                          {index === 2 && application?.status === 'approved' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : index === 2 && application?.status === 'rejected' ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Progress Bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ 
                      width: application?.status === 'submitted' ? '33%' : 
                             application?.status === 'under_review' ? '66%' : 
                             ['approved', 'rejected'].includes(application?.status) ? '100%' : '0%'
                    }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className={`mt-6 p-4 rounded-xl border-2 ${
                application?.status === 'approved' ? 'bg-green-500/10 border-green-500/20' :
                application?.status === 'rejected' ? 'bg-red-500/10 border-red-500/20' :
                'bg-blue-500/10 border-blue-500/20'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    application?.status === 'approved' ? 'bg-green-500/20' :
                    application?.status === 'rejected' ? 'bg-red-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {application?.status === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : application?.status === 'rejected' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {application?.status === 'approved' ? 'Congratulations!' :
                       application?.status === 'rejected' ? 'Application Not Successful' :
                       'Application Under Processing'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {application?.status === 'approved' ? 
                        'Your application has been approved. You are now an official candidate.' :
                       application?.status === 'rejected' ? 
                        'Unfortunately, your application was not successful. Contact the electoral committee for more details.' :
                       application?.status === 'under_review' ?
                        'The electoral committee is currently reviewing your application. You will be notified once a decision is made.' :
                        'Your application has been received and is awaiting review by the electoral committee.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Closed Notice */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-dashed flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Application Submitted</p>
                  <p className="text-xs text-muted-foreground">Each aspirant can only submit one application per election cycle.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Application Information - Show for any existing application */}
        {hasExistingApplication && application && (
          <Card className="mt-6 animate-fade-in border-0 shadow-lg" style={{ animationDelay: '400ms' }}>
            <CardHeader className="bg-muted/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Application Details
                  </CardTitle>
                  <CardDescription>
                    {isPendingApplication
                      ? "Your application draft - complete and submit to finalize"
                      : "Your complete submitted application information"}
                  </CardDescription>
                </div>

                {hasSubmittedApplication && (
                  <Button variant="outline" onClick={handleDownloadApplicationPdf} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="leadership">Leadership</TabsTrigger>
                  <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Full Name</span>
                        <p className="font-semibold">{application.full_name || (application.step_data as any)?.personal?.full_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Email</span>
                        <p className="font-semibold">{application.email || userEmail || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Phone</span>
                        <p className="font-semibold">{application.phone || (application.step_data as any)?.personal?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Date of Birth</span>
                        <p className="font-semibold">
                          {application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 
                           (application.step_data as any)?.personal?.date_of_birth ? new Date((application.step_data as any)?.personal?.date_of_birth).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Gender</span>
                        <p className="font-semibold capitalize">{application.gender || (application.step_data as any)?.personal?.gender || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Department</span>
                        <p className="font-semibold">{application.department || (application.step_data as any)?.personal?.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Matric Number</span>
                        <p className="font-mono font-semibold">{application.matric_number || (application.step_data as any)?.personal?.matric || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Level</span>
                        <p className="font-semibold">{application.level || (application.step_data as any)?.personal?.level || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl col-span-2 md:col-span-1">
                      <Award className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">CGPA</span>
                        <p className="font-bold text-xl text-primary">
                          {(application.cgpa || (application.step_data as any)?.academic?.cgpa)?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Position Applied</span>
                        <p className="font-semibold">{application.positions?.title || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  {application.payment_proof_url && (
                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-600">Payment Verified</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Your payment proof has been uploaded successfully.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="leadership" className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Leadership Experience
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.leadership_history || (application.step_data as any)?.leadership?.experience || 'No leadership experience provided.'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Why I'm Running
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.why_running || (application.step_data as any)?.leadership?.whyRunning || 'Not provided.'}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="manifesto" className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      My Manifesto
                    </h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.manifesto || (application.step_data as any)?.manifesto?.content || 'No manifesto provided.'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Continue Application Button for pending applications */}
              {isPendingApplication && (
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    className="w-full gap-2 group h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" 
                    onClick={() => navigate("/aspirant/apply")}
                  >
                    <FileText className="h-5 w-5" />
                    Continue Application
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Positions - Only show when not submitted */}
        {!hasSubmittedApplication && (
          <Card className="mt-6 animate-fade-in border-0 shadow-lg" style={{ animationDelay: '300ms' }}>
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Available Positions
              </CardTitle>
              <CardDescription>View all available positions and their requirements</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {positions.map((position, index) => (
                  <Card 
                    key={position.id} 
                    className="border group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${(index + 4) * 50}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2 relative">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{position.title}</CardTitle>
                        <Badge className="bg-primary/10 text-primary border-0 font-mono text-sm">
                          ₦{position.fee?.toLocaleString() || 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm relative">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground block">Min CGPA</span>
                          <span className="font-bold text-base">{position.min_cgpa}</span>
                        </div>
                        <div className="p-2.5 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground block">Levels</span>
                          <span className="font-semibold">{position.eligible_levels?.join(', ') || 'All'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <strong>Departments:</strong> {position.eligible_departments?.join(', ') || 'All'}
                      </p>
                      {position.eligible_gender && (
                        <Badge variant="outline" className="capitalize">
                          {position.eligible_gender} only
                        </Badge>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" 
                        onClick={() => navigate("/aspirant/apply")}
                      >
                        Apply Now
                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {positions.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-muted/30 rounded-2xl">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No positions available at this time.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AspirantDashboard;
