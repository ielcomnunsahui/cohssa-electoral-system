import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, Award, ArrowLeft, User, Briefcase, GraduationCap, Phone, Mail, MapPin, Loader2, FileText, Clock, Eye, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PromotionConfirmDialog } from "@/components/admin/PromotionConfirmDialog";
import { ManifestoEditor } from "@/components/admin/ManifestoEditor";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SEO from "@/components/SEO";

const AspirantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [screeningDate, setScreeningDate] = useState("");
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('aspirants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setApplication(data);
      
      if (data?.position_id) {
        const { data: posData } = await supabase
          .from('positions')
          .select('*')
          .eq('id', data.position_id)
          .single();
        setPosition(posData);
      }
      
      const stepData = data?.step_data as any;
      setAdminNotes(stepData?.admin_notes || "");
    } catch (error: any) {
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('aspirants')
        .update({ 
          status,
          step_data: {
            ...(application?.step_data as object || {}),
            admin_notes: adminNotes
          }
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Status updated to: ${status.replace(/_/g, ' ')}`);
      loadApplication();
    } catch (error: any) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const verifyPayment = async (verified: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('aspirants')
        .update({ 
          status: verified ? 'payment_verified' : 'pending'
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(verified ? "Payment verified" : "Payment verification removed");
      loadApplication();
    } catch (error: any) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const scheduleScreening = async () => {
    if (!screeningDate) {
      toast.error("Please select a screening date");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('aspirants')
        .update({
          status: 'screening_scheduled',
          step_data: {
            ...(application?.step_data as object || {}),
            screening_date: screeningDate,
            admin_notes: adminNotes
          }
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Screening scheduled");
      
      const phone = application?.phone?.replace(/^0/, '234');
      const message = `Hello ${application?.full_name || application?.name}, your screening for the position of ${position?.title || 'elected position'} has been scheduled for ${new Date(screeningDate).toLocaleString()}. Please be punctual. - Electoral Committee`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      
      loadApplication();
    } catch (error: any) {
      toast.error("Failed to schedule screening");
    } finally {
      setUpdating(false);
    }
  };

  const promoteToCandidate = async () => {
    setShowPromotionDialog(false);
    setUpdating(true);
    
    try {
      const { error: updateError } = await supabase
        .from('aspirants')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      const { error: candidateError } = await supabase
        .from('candidates')
        .insert({
          application_id: application.id,
          name: application.full_name || application.name,
          matric: application.matric_number || application.matric,
          department: application.department,
          photo_url: application.photo_url || '',
          manifesto: application.why_running || application.manifesto,
          position_id: application.position_id
        });

      if (candidateError) throw candidateError;
      toast.success("Aspirant promoted to candidate successfully!");
      loadApplication();
    } catch (error: any) {
      toast.error(error.message || "Failed to promote to candidate");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-amber-500/10", text: "text-amber-600", icon: Clock },
      submitted: { bg: "bg-blue-500/10", text: "text-blue-600", icon: FileText },
      under_review: { bg: "bg-purple-500/10", text: "text-purple-600", icon: Eye },
      payment_verified: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: CheckCircle },
      screening_scheduled: { bg: "bg-indigo-500/10", text: "text-indigo-600", icon: Calendar },
      approved: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle },
      rejected: { bg: "bg-red-500/10", text: "text-red-600", icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!application) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Application not found</h2>
          <Button variant="outline" onClick={() => navigate("/admin/aspirants")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;
  const isPaymentVerified = ['payment_verified', 'approved', 'screening_scheduled'].includes(application.status);

  return (
    <AdminLayout>
      <SEO 
        title={`Review: ${application.full_name || application.name}`}
        description="Review aspirant application details, verify payment, schedule screening, and manage candidate status."
      />
      
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/aspirants")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-primary/20">
                <AvatarImage src={application.photo_url || (application.step_data as any)?.personal?.photo_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {(application.full_name || application.name || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{application.full_name || application.name}</h1>
                <p className="text-muted-foreground font-mono">{application.matric_number}</p>
              </div>
            </div>
          </div>
          <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 text-sm px-4 py-2`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            {application.status?.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-xs">Department</span>
                    </div>
                    <p className="font-semibold">{application.department}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-xs">Level</span>
                    </div>
                    <p className="font-semibold">{application.level}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-xs">CGPA</span>
                    </div>
                    <p className="font-bold text-xl text-primary">{application.cgpa?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-xs">Gender</span>
                    </div>
                    <p className="font-semibold capitalize">{application.gender || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-xs">Phone</span>
                    </div>
                    <p className="font-semibold">{application.phone || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Award className="h-4 w-4" />
                      <span className="text-xs">Position</span>
                    </div>
                    <p className="font-semibold">{position?.title || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Why Running / Manifesto</Label>
                    <p className="text-sm mt-2 p-4 bg-muted/30 rounded-xl">{application.why_running || application.manifesto || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Leadership History</Label>
                    <p className="text-sm mt-2 p-4 bg-muted/30 rounded-xl">{application.leadership_history || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes & Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Admin Notes & Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this application..."
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Update Status</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => updateStatus('under_review')} disabled={updating} className="text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus('screening_scheduled')} disabled={updating} className="text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Screened
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-sm" onClick={() => updateStatus('approved')} disabled={updating}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus('rejected')} disabled={updating} className="text-sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Candidate Promotion */}
                <div className="border-t pt-6">
                  <Label className="text-base font-semibold">Candidate Promotion</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Promote qualified aspirants to official candidates for the election
                  </p>
                  
                  {application.status === 'approved' ? (
                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/50 rounded-xl text-center">
                      <Award className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-bold text-lg text-green-600 mb-1">Candidate Status Active</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        This aspirant has been promoted to official candidate
                      </p>
                      <Button 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        onClick={() => navigate("/admin/candidates")}
                      >
                        View in Candidates Page
                      </Button>
                    </div>
                  ) : (isPaymentVerified) ? (
                    <Button 
                      onClick={() => setShowPromotionDialog(true)} 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg h-12"
                      disabled={updating}
                    >
                      <Award className="mr-2 h-5 w-5" />
                      Promote to Candidate
                    </Button>
                  ) : (
                    <div className="p-4 bg-muted/50 border border-muted rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">
                        Verify payment or complete screening to enable candidate promotion
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {application.status === 'approved' && (
              <ManifestoEditor
                applicationId={application.id}
                initialManifesto={application.why_running || application.manifesto}
                candidateName={application.full_name || application.name}
              />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Payment Verification */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Payment Verification</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={isPaymentVerified ? "default" : "outline"}
                    onClick={() => verifyPayment(true)}
                    className="flex-1"
                    disabled={updating}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verified
                  </Button>
                  <Button
                    variant={!isPaymentVerified ? "destructive" : "outline"}
                    onClick={() => verifyPayment(false)}
                    className="flex-1"
                    disabled={updating}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Not Verified
                  </Button>
                </div>
                {application.payment_proof_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={application.payment_proof_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      View Payment Proof
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Screening */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Schedule Screening</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Screening Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={screeningDate}
                    onChange={(e) => setScreeningDate(e.target.value)}
                  />
                </div>
                <Button onClick={scheduleScreening} className="w-full" disabled={updating}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule & Send WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Application Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                {application.submitted_at && (
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">{new Date(application.submitted_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{new Date(application.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <PromotionConfirmDialog
          open={showPromotionDialog}
          onOpenChange={setShowPromotionDialog}
          onConfirm={promoteToCandidate}
          candidateData={{
            name: application.full_name || application.name,
            matric: application.matric_number || application.matric,
            department: application.department,
            position: position?.title || 'N/A',
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AspirantDetail;
