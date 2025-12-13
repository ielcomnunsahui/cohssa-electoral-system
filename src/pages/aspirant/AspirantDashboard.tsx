import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, CheckCircle, MessageSquare, User, Award, Lock, LogOut, Briefcase, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const AspirantDashboard = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/aspirant/login");
        return;
      }
      
      setUserEmail(user.email || "");

      const [appResult, positionsResult] = await Promise.all([
        supabase
          .from('aspirant_applications')
          .select('*, aspirant_positions(*)')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('aspirant_positions')
          .select('*')
          .eq('is_active', true)
          .order('position_name')
      ]);

      if (!appResult.error && appResult.data) {
        setApplication(appResult.data);
      }

      if (!positionsResult.error && positionsResult.data) {
        setPositions(positionsResult.data);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const statuses = ['submitted', 'payment_verified', 'under_review', 'screening_scheduled', 'screening_completed', 'qualified', 'candidate'];
  
  const getStatusInfo = () => {
    if (!application) return { text: "Not Started", color: "text-muted-foreground", icon: Clock, description: "Start your application", progress: 0 };
    
    const currentIdx = statuses.indexOf(application.status);
    const progress = ((currentIdx + 1) / statuses.length) * 100;

    const statusMap: Record<string, { text: string; color: string; icon: any; description: string; progress: number }> = {
      submitted: { text: "Submitted", color: "text-blue-500", icon: Clock, description: "Awaiting payment verification", progress },
      payment_verified: { text: "Payment Verified", color: "text-green-500", icon: CheckCircle, description: "Payment confirmed. Under admin review", progress },
      under_review: { text: "Under Review", color: "text-yellow-500", icon: Clock, description: "Admin is reviewing your application", progress },
      screening_scheduled: { text: "Screening Scheduled", color: "text-purple-500", icon: Clock, description: "Your screening has been scheduled", progress },
      screening_completed: { text: "Screening Completed", color: "text-indigo-500", icon: CheckCircle, description: "Awaiting final decision", progress },
      qualified: { text: "Qualified", color: "text-green-600", icon: CheckCircle, description: "Congratulations! You have been qualified", progress },
      disqualified: { text: "Disqualified", color: "text-red-500", icon: CheckCircle, description: "Your application was not successful", progress: 0 },
      candidate: { text: "Promoted to Candidate", color: "text-primary", icon: Award, description: "You are now an official candidate!", progress: 100 },
    };

    return statusMap[application.status] || { text: "Unknown", color: "text-muted-foreground", icon: Clock, description: "", progress: 0 };
  };

  const hasSubmittedApplication = application && statuses.includes(application.status);
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container relative mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 animate-fade-in">
          <div className="relative">
            {application?.photo_url || application?.step_data?.personal?.photo_url ? (
              <img 
                src={application.photo_url || application.step_data?.personal?.photo_url} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-primary/20">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {application?.status === 'candidate' && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {application?.full_name || application?.step_data?.personal?.full_name || "Welcome, Aspirant!"}
            </h1>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Application Status Card */}
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Card className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                  Application Status
                </CardTitle>
                <CardDescription>Track your application progress</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Status Banner */}
                <div className="p-4 bg-muted/50 rounded-xl border">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${statusInfo.color.replace('text-', 'bg-')}/10`}>
                      <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-xl ${statusInfo.color}`}>{statusInfo.text}</p>
                      <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                    </div>
                  </div>
                  {application && application.status !== 'disqualified' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(statusInfo.progress)}%</span>
                      </div>
                      <Progress value={statusInfo.progress} className="h-2" />
                    </div>
                  )}
                </div>

                {application && (
                  <>
                    {/* Progress Steps */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">Application Progress</h3>
                      <div className="grid grid-cols-7 gap-1">
                        {statuses.map((status, idx) => {
                          const currentIdx = statuses.indexOf(application.status);
                          const isCompleted = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          
                          return (
                            <div key={status} className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Position</span>
                        <p className="font-semibold">{application.aspirant_positions?.position_name || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Submitted</span>
                        <p className="font-semibold">
                          {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Not yet'}
                        </p>
                      </div>
                      {application.payment_verified !== null && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block mb-1">Payment</span>
                          <Badge variant={application.payment_verified ? "default" : "secondary"}>
                            {application.payment_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      )}
                      {application.screening_date && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <span className="text-xs text-muted-foreground block mb-1">Screening Date</span>
                          <p className="font-semibold text-purple-500">
                            {new Date(application.screening_date).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {application.admin_notes && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Admin Notes
                        </p>
                        <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                      </div>
                    )}
                  </>
                )}

                {!hasSubmittedApplication && (
                  <Button className="w-full gap-2 group" onClick={() => navigate("/aspirant/apply")}>
                    <FileText className="h-4 w-4" />
                    {application ? "Continue Application" : "Start New Application"}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Info Card */}
          <Card className="animate-fade-in h-fit" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application && (
                <>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground block mb-1">Matric</span>
                    <p className="font-mono font-semibold">{application.matric || application.step_data?.personal?.matric || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground block mb-1">Department</span>
                    <p className="font-semibold text-sm">{application.department || application.step_data?.personal?.department || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <span className="text-xs text-muted-foreground block mb-1">Level</span>
                    <p className="font-semibold">{application.level || application.step_data?.personal?.level || 'N/A'}</p>
                  </div>
                  {application.cgpa > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">CGPA</span>
                      <p className="font-semibold text-lg">{application.cgpa?.toFixed(2)}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Positions */}
        <Card className="mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Available Positions
            </CardTitle>
            <CardDescription>
              {hasSubmittedApplication 
                ? "You have already submitted an application. Each aspirant can only apply once."
                : "View all available positions and their requirements"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {positions.map((position, index) => (
                <Card 
                  key={position.id} 
                  className="border group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${(index + 4) * 50}ms` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{position.position_name}</CardTitle>
                      <Badge variant="secondary" className="font-mono">₦{position.fee.toLocaleString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Min CGPA:</span>
                        <span className="font-semibold ml-1">{position.min_cgpa}</span>
                      </div>
                      <div className="p-2 bg-muted/30 rounded">
                        <span className="text-muted-foreground">Levels:</span>
                        <span className="font-semibold ml-1">{position.eligible_levels?.join(', ')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Departments: {position.eligible_departments?.join(', ')}
                    </p>
                    {position.eligible_gender && (
                      <p className="text-xs text-muted-foreground capitalize">
                        Gender: {position.eligible_gender} only
                      </p>
                    )}
                    {hasSubmittedApplication ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        Application Closed
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => navigate("/aspirant/apply")}>
                        Apply Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AspirantDashboard;