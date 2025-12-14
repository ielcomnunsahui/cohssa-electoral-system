import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ReviewStepProps {
  formData: any;
  applicationId: string | null;
}

const ReviewStep = ({ formData, applicationId }: ReviewStepProps) => {
  const navigate = useNavigate();
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { step_data } = formData;

  const handleSubmit = async () => {
    if (!acceptedDeclaration) {
      toast.error("Please accept the declaration to submit your application");
      return;
    }

    if (!applicationId) {
      toast.error("Application not found");
      return;
    }

    setSubmitting(true);
    try {
      // Here you would upload files to storage and get URLs
      // For now, we'll just update the application status

      const { error } = await supabase
        .from('aspirants')
        .update({
          name: step_data.personal.full_name,
          full_name: step_data.personal.full_name,
          matric: step_data.personal.matric,
          matric_number: step_data.personal.matric,
          department: step_data.personal.department,
          level: step_data.personal.level,
          date_of_birth: step_data.personal.date_of_birth,
          gender: step_data.personal.gender,
          phone: step_data.personal.phone,
          position_id: step_data.position.position_id,
          why_running: step_data.position.why_running,
          cgpa: parseFloat(step_data.academic.cgpa),
          leadership_history: step_data.leadership.leadership_history,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success("Application submitted successfully!");
      navigate("/aspirant/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Please review all your information carefully before submitting. Once submitted, you cannot edit your application.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step_data.personal.photo_url && (
            <div className="flex justify-center">
              <img 
                src={step_data.personal.photo_url} 
                alt="Applicant photo" 
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
            </div>
          )}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name:</span>
              <span className="font-semibold">{step_data.personal.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Matric:</span>
              <span className="font-semibold">{step_data.personal.matric}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-semibold">{step_data.personal.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level:</span>
              <span className="font-semibold">{step_data.personal.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span>
              <span className="font-semibold">{step_data.personal.date_of_birth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender:</span>
              <span className="font-semibold capitalize">{step_data.personal.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-semibold">{step_data.personal.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Position & Academic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-semibold">{step_data.position.position_details?.position_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee:</span>
              <span className="font-semibold">₦{step_data.position.position_details?.fee?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Why Running:</span>
              <p className="mt-1 p-2 bg-muted rounded text-sm">{step_data.position.why_running}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CGPA:</span>
              <span className="font-semibold">{parseFloat(step_data.academic.cgpa).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Leadership History:</span>
              <p className="mt-1 p-2 bg-muted rounded text-sm">{step_data.leadership.leadership_history}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Proof</CardTitle>
        </CardHeader>
        <CardContent>
          {step_data.payment.payment_proof_url ? (
            <div className="space-y-2">
              <img 
                src={step_data.payment.payment_proof_url} 
                alt="Payment proof" 
                className="w-full max-w-md mx-auto rounded border"
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No payment proof uploaded</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Declaration</CardTitle>
          <CardDescription>Please read and accept the declaration below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50 text-sm space-y-2">
            <p>I hereby declare that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All information provided in this application is true and accurate</li>
              <li>I understand that providing false information may lead to disqualification</li>
              <li>I accept the election rules and regulations</li>
              <li>I will accept the final election results in good faith</li>
              <li>I will conduct my campaign in a peaceful and ethical manner</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="declaration"
              checked={acceptedDeclaration}
              onCheckedChange={(checked) => setAcceptedDeclaration(checked as boolean)}
            />
            <Label htmlFor="declaration" className="cursor-pointer">
              I accept the declaration and all terms and conditions
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!acceptedDeclaration || submitting}
            className="w-full bg-success hover:bg-success/90"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
