import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PersonalInfoStep from "@/components/aspirant/PersonalInfoStep";
import PositionStep from "@/components/aspirant/PositionStep";
import AcademicStep from "@/components/aspirant/AcademicStep";
import LeadershipStep from "@/components/aspirant/LeadershipStep";
import RefereeStep from "@/components/aspirant/RefereeStep";
import PaymentStep from "@/components/aspirant/PaymentStep";
import ReviewStep from "@/components/aspirant/ReviewStep";
import {
  validatePersonalInfo,
  validatePositionStep,
  validateAcademicStep,
  validateLeadershipStep,
  validateRefereeStep,
  validatePaymentStep,
  ValidationResult
} from "@/lib/validations";

const TOTAL_STEPS = 7;

const ApplicationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    step_data: {
      personal: {},
      position: {},
      academic: {},
      leadership: {},
      referee: {},
      payment: {}
    }
  });

  useEffect(() => {
    loadExistingApplication();
  }, []);

  useEffect(() => {
    // Autosave whenever formData changes
    const timeoutId = setTimeout(() => {
      if (applicationId) {
        autoSave();
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, applicationId]);

  const loadExistingApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/aspirant/login");
        return;
      }

      const { data, error } = await supabase
        .from('aspirant_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setApplicationId(data.id);
        setCurrentStep(data.current_step || 1);
        setFormData({
          ...data,
          step_data: data.step_data || { personal: {}, position: {}, academic: {}, leadership: {}, referee: {}, payment: {} }
        });
        toast.success("Application loaded");
      }
    } catch (error: any) {
      console.error("Error loading application:", error);
    }
  };

  const autoSave = async () => {
    if (!applicationId) return;

    try {
      const { error } = await supabase
        .from('aspirant_applications')
        .update({
          current_step: currentStep,
          step_data: formData.step_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Autosave error:", error);
    }
  };

  const validateCurrentStep = (): ValidationResult => {
    const { step_data } = formData;
    
    switch (currentStep) {
      case 1:
        return validatePersonalInfo(step_data.personal);
      case 2:
        return validatePositionStep(step_data.position, step_data.personal);
      case 3:
        return validateAcademicStep(step_data.academic, step_data.position);
      case 4:
        return validateLeadershipStep(step_data.leadership);
      case 5:
        return validateRefereeStep(step_data.referee);
      case 6:
        return validatePaymentStep(step_data.payment);
      case 7:
        return { isValid: true, errors: [] }; // Review step has no validation
      default:
        return { isValid: true, errors: [] };
    }
  };

  const handleNext = async () => {
    const validation = validateCurrentStep();
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error("Please complete all required fields before proceeding");
      return;
    }
    
    setValidationErrors([]);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (applicationId) {
        const { error } = await supabase
          .from('aspirant_applications')
          .update({
            current_step: currentStep,
            step_data: formData.step_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('aspirant_applications')
          .insert({
            user_id: user.id,
            current_step: currentStep,
            step_data: formData.step_data,
            full_name: '',
            matric: '',
            department: 'Nursing Sciences' as const,
            level: '100L' as const,
            date_of_birth: new Date().toISOString().split('T')[0],
            gender: 'male' as const,
            phone: '',
            cgpa: 0,
            why_running: '',
            leadership_history: '',
            status: 'submitted'
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setApplicationId(data.id);
      }

      toast.success("Progress saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const updateStepData = (step: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      step_data: {
        ...prev.step_data,
        [step]: data
      }
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={formData.step_data.personal} onUpdate={(data) => updateStepData('personal', data)} />;
      case 2:
        return <PositionStep 
          data={formData.step_data.position} 
          onUpdate={(data) => updateStepData('position', data)}
          personalData={{
            department: formData.step_data.personal.department,
            level: formData.step_data.personal.level,
            gender: formData.step_data.personal.gender,
            cgpa: formData.step_data.academic.cgpa
          }}
        />;
      case 3:
        return <AcademicStep data={formData.step_data.academic} onUpdate={(data) => updateStepData('academic', data)} positionData={formData.step_data.position} />;
      case 4:
        return <LeadershipStep data={formData.step_data.leadership} onUpdate={(data) => updateStepData('leadership', data)} />;
      case 5:
        return <RefereeStep data={formData.step_data.referee} onUpdate={(data) => updateStepData('referee', data)} />;
      case 6:
        return <PaymentStep data={formData.step_data.payment} onUpdate={(data) => updateStepData('payment', data)} />;
      case 7:
        return <ReviewStep formData={formData} applicationId={applicationId} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/aspirant/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Aspirant Application - Step {currentStep} of {TOTAL_STEPS}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Position Selection"}
              {currentStep === 3 && "Academic Details"}
              {currentStep === 4 && "Leadership History"}
              {currentStep === 5 && "Referee & Declaration"}
              {currentStep === 6 && "Payment Proof"}
              {currentStep === 7 && "Review & Submit"}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {renderStep()}

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button variant="secondary" onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Progress"}
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="bg-success hover:bg-success/90">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplicationWizard;
