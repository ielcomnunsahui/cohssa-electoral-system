import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle, User, Briefcase, GraduationCap, Trophy, Users, CreditCard, FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEO from "@/components/SEO";
import DualLogo from "@/components/DualLogo";
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

const steps = [
  { id: 1, title: "Personal Info", icon: User, description: "Your basic information" },
  { id: 2, title: "Position", icon: Briefcase, description: "Choose your position" },
  { id: 3, title: "Academic", icon: GraduationCap, description: "Academic details" },
  { id: 4, title: "Leadership", icon: Trophy, description: "Experience & history" },
  { id: 5, title: "Referee", icon: Users, description: "References" },
  { id: 6, title: "Payment", icon: CreditCard, description: "Upload proof" },
  { id: 7, title: "Review", icon: FileCheck, description: "Submit application" },
];

const ApplicationWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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
        .from('aspirants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setApplicationId(data.id);
        const stepData = (data.step_data as any) || { personal: {}, position: {}, academic: {}, leadership: {}, referee: {}, payment: {} };
        setFormData({
          ...data,
          step_data: stepData
        });
        toast.success("Application loaded");
      }
    } catch (error: any) {
      console.error("Error loading application:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const autoSave = async () => {
    if (!applicationId) return;

    try {
      const { error } = await supabase
        .from('aspirants')
        .update({
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
        return { isValid: true, errors: [] };
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const personal = formData.step_data?.personal || {};
      const academic = formData.step_data?.academic || {};

      if (applicationId) {
        const { error } = await supabase
          .from('aspirants')
          .update({
            step_data: formData.step_data,
            full_name: personal.full_name || '',
            matric_number: personal.matric || '',
            department: personal.department || 'Nursing Science',
            level: personal.level || '100L',
            date_of_birth: personal.date_of_birth || null,
            gender: personal.gender || null,
            phone: personal.phone || '',
            email: personal.email || user.email || '',
            cgpa: academic.cgpa || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('aspirants')
          .insert({
            user_id: user.id,
            step_data: formData.step_data,
            name: personal.full_name || 'New Aspirant',
            full_name: personal.full_name || '',
            matric_number: personal.matric || 'PENDING',
            department: personal.department || 'Nursing Science',
            level: personal.level || '100L',
            date_of_birth: personal.date_of_birth || null,
            gender: personal.gender || null,
            phone: personal.phone || '',
            email: personal.email || user.email || '',
            cgpa: academic.cgpa || null,
            status: 'pending'
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
  const currentStepInfo = steps[currentStep - 1];

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title={`Application - Step ${currentStep}`} 
        description="Complete your COHSSA election aspirant application. Fill in personal details, select position, and submit your candidacy."
      />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/aspirant/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
          <DualLogo size="sm" />
          <div className="w-24" />
        </div>
      </header>

      <main className="container relative mx-auto px-4 py-6 max-w-4xl">
        {/* Step Indicators - Desktop */}
        <div className="hidden lg:flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center group">
                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30' : ''}
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-muted text-muted-foreground' : ''}
                    `}
                  >
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded transition-colors ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Indicators - Mobile */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm font-medium">{currentStepInfo.title}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentStep >= step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <currentStepInfo.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Step {currentStep}: {currentStepInfo.title}</CardTitle>
                <CardDescription>{currentStepInfo.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="animate-fade-in">
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
            
            <div className="animate-fade-in" key={currentStep}>
              {renderStep()}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="gap-2 order-2 sm:order-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button 
                variant="secondary" 
                onClick={handleSave} 
                disabled={loading}
                className="gap-2 order-3 sm:order-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Progress"}
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext} className="gap-2 order-1 sm:order-3">
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="order-1 sm:order-3" />
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApplicationWizard;
