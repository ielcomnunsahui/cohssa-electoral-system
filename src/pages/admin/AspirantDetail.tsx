import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PromotionConfirmDialog } from "@/components/admin/PromotionConfirmDialog";
import { ManifestoEditor } from "@/components/admin/ManifestoEditor";
import { AdminLayout } from "@/components/admin/AdminLayout";

const AspirantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [screeningDate, setScreeningDate] = useState("");
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

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
      
      // Get position details if position_id exists
      if (data?.position_id) {
        const { data: posData } = await supabase
          .from('positions')
          .select('*')
          .eq('id', data.position_id)
          .single();
        setPosition(posData);
      }
      
      // Load step_data for admin notes if available
      const stepData = data?.step_data as any;
      setAdminNotes(stepData?.admin_notes || "");
    } catch (error: any) {
      toast.error("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
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
      toast.success(`Status updated to: ${status}`);
      loadApplication();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const verifyPayment = async (verified: boolean) => {
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
    }
  };

  const scheduleScreening = async () => {
    if (!screeningDate) {
      toast.error("Please select a screening date");
      return;
    }

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
    }
  };

  const handlePromotionClick = () => {
    setShowPromotionDialog(true);
  };

  const promoteToCandidate = async () => {
    setShowPromotionDialog(false);
    
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
      console.error("Promotion error:", error);
      toast.error(error.message || "Failed to promote to candidate");
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="p-8">Loading...</div>
    </AdminLayout>
  );
  
  if (!application) return (
    <AdminLayout>
      <div className="p-8">Application not found</div>
    </AdminLayout>
  );

  const isPaymentVerified = application.status === 'payment_verified' || application.status === 'approved';

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Applicant Information</CardTitle>
                  <CardDescription>{application.full_name || application.name} - {application.matric_number || application.matric}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    application.status === 'approved' ? 'bg-green-500/20 text-green-600' :
                    application.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                    application.status === 'screening_scheduled' ? 'bg-purple-500/20 text-purple-600' :
                    application.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-600' :
                    application.status === 'payment_verified' ? 'bg-green-400/20 text-green-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {application.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <p className="font-semibold">{application.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>
                  <p className="font-semibold">{application.level}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">CGPA:</span>
                  <p className="font-semibold">{application.cgpa?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <p className="font-semibold capitalize">{application.gender || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-semibold">{application.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <p className="font-semibold">{position?.title || 'N/A'}</p>
                </div>
              </div>

              <div>
                <Label>Why Running:</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded">{application.why_running || application.manifesto || 'Not provided'}</p>
              </div>

              <div>
                <Label>Leadership History:</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded">{application.leadership_history || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={isPaymentVerified ? "default" : "outline"}
                    onClick={() => verifyPayment(true)}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verified
                  </Button>
                  <Button
                    variant={!isPaymentVerified ? "destructive" : "outline"}
                    onClick={() => verifyPayment(false)}
                    className="flex-1"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Not Verified
                  </Button>
                </div>
                {application.payment_proof_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={application.payment_proof_url} target="_blank" rel="noopener noreferrer">
                      View Payment Proof
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Screening</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Schedule Screening</Label>
                  <Input
                    type="datetime-local"
                    value={screeningDate}
                    onChange={(e) => setScreeningDate(e.target.value)}
                  />
                </div>
                <Button onClick={scheduleScreening} className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule & Send WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin Notes & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this application..."
                />
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => updateStatus('under_review')}>
                    Under Review
                  </Button>
                  <Button variant="outline" onClick={() => updateStatus('screening_scheduled')}>
                    Screening Done
                  </Button>
                  <Button variant="default" className="bg-green-600 hover:bg-green-600/90" onClick={() => updateStatus('approved')}>
                    Approved
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus('rejected')}>
                    Rejected
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Candidate Promotion</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Promote qualified aspirants to official candidates for the election
                </p>
                
                {application.status === 'approved' && (
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/10 border-2 border-green-500 rounded-lg text-center">
                    <Award className="w-10 h-10 text-green-500 mx-auto mb-3" />
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
                )}
                
                {(application.status === 'payment_verified' || application.status === 'screening_scheduled') && (
                  <Button 
                    onClick={handlePromotionClick} 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-500/90 hover:to-green-600/90 text-white shadow-lg"
                    size="lg"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    Promote to Candidate
                  </Button>
                )}
                
                {!['approved', 'payment_verified', 'screening_scheduled'].includes(application.status) && (
                  <div className="p-4 bg-muted/50 border border-muted rounded-lg text-center">
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