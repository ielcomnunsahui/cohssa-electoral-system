import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  UserPlus, 
  Vote, 
  FileText, 
  CheckCircle, 
  Mail, 
  Fingerprint,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
  Play,
  IdCard,
  User,
  GraduationCap,
  Award,
  Clock,
  Lock,
  Zap,
  Eye
} from "lucide-react";
import { DualLogo } from "@/components/NavLink";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import SEO from "@/components/SEO";

const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

const DemoVoterRegistration = () => {
  const [step, setStep] = useState<'matric' | 'email' | 'otp' | 'biometric' | 'success'>('matric');
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [matricError, setMatricError] = useState<string | null>(null);

  const validateMatric = (value: string) => {
    setMatric(value);
    if (!value) {
      setMatricError(null);
    } else if (!MATRIC_REGEX.test(value)) {
      setMatricError("Invalid format. Use: XX/XXaaa000 (e.g., 21/08NUS014)");
    } else {
      setMatricError(null);
    }
  };

  const steps = [
    { id: 'matric', label: 'Matric', icon: IdCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'otp', label: 'Verify', icon: Shield },
    { id: 'biometric', label: 'Security', icon: Fingerprint },
  ];

  const getProgress = () => {
    const idx = steps.findIndex(s => s.id === step);
    return ((idx + 1) / (steps.length + 1)) * 100;
  };

  if (step === 'success') {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Registration Complete!</h3>
          <p className="text-sm text-muted-foreground">
            In a real scenario, you would receive an email verification and wait for admin approval.
          </p>
          <Button variant="outline" onClick={() => { setStep('matric'); setMatric(""); setEmail(""); setOtp(""); }}>
            <Play className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isCompleted = steps.findIndex(st => st.id === step) > index;
          
          return (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                ${isCompleted ? 'bg-primary text-primary-foreground' : 
                  isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                  'bg-muted text-muted-foreground'}
              `}>
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={getProgress()} className="h-2" />

      {step === 'matric' && (
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IdCard className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Enter Matric Number</CardTitle>
            <CardDescription>We'll verify you're a registered student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Matric Number</Label>
              <Input
                placeholder="e.g., 21/08NUS014"
                value={matric}
                onChange={(e) => validateMatric(e.target.value)}
                className={`h-12 text-center font-mono ${matricError ? 'border-destructive' : ''}`}
              />
              {matricError && <p className="text-sm text-destructive">{matricError}</p>}
            </div>
            <Button 
              className="w-full h-12 gap-2" 
              onClick={() => {
                if (!MATRIC_REGEX.test(matric)) {
                  toast.error("Please enter a valid matric number");
                  return;
                }
                toast.success("Demo: Student verified!");
                setStep('email');
              }}
              disabled={!!matricError || !matric}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'email' && (
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Add Your Email</CardTitle>
            <CardDescription>We'll send a verification code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Demo Student</p>
                <p className="text-xs text-muted-foreground">{matric}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('matric')} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => {
                  if (!email.includes("@")) {
                    toast.error("Please enter a valid email");
                    return;
                  }
                  toast.success("Demo: Verification code sent!");
                  setStep('otp');
                }}
              >
                Send Code
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'otp' && (
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Verify Email</CardTitle>
            <CardDescription>Enter the 6-digit code (use any digits for demo)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-10" />
                  <InputOTPSlot index={1} className="h-12 w-10" />
                  <InputOTPSlot index={2} className="h-12 w-10" />
                  <InputOTPSlot index={3} className="h-12 w-10" />
                  <InputOTPSlot index={4} className="h-12 w-10" />
                  <InputOTPSlot index={5} className="h-12 w-10" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              className="w-full gap-2" 
              onClick={() => {
                if (otp.length !== 6) {
                  toast.error("Please enter 6 digits");
                  return;
                }
                toast.success("Demo: Email verified!");
                setStep('biometric');
              }}
              disabled={otp.length !== 6}
            >
              Verify
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setStep('email')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'biometric' && (
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Set Up Quick Login</CardTitle>
            <CardDescription>Use biometric for faster access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Fingerprint className="h-4 w-4" />
              <AlertDescription>
                This is a demo. In production, this uses WebAuthn for secure biometric authentication.
              </AlertDescription>
            </Alert>
            <Button className="w-full h-12 gap-2" onClick={() => { toast.success("Demo: Biometric registered!"); setStep('success'); }}>
              <Fingerprint className="h-5 w-5" />
              Enable Biometric (Demo)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep('success')}>
              Skip - Use Email OTP
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const DemoVoting = () => {
  const [voted, setVoted] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const candidates = [
    { id: "1", name: "Adebayo Johnson", department: "Medicine and Surgery", photo: "AJ" },
    { id: "2", name: "Fatima Ibrahim", department: "Nursing Sciences", photo: "FI" },
    { id: "3", name: "Emmanuel Okonkwo", department: "Human Anatomy", photo: "EO" },
  ];

  if (submitted) {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20 animate-fade-in">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Vote Cast Successfully!</h3>
          <p className="text-muted-foreground">Your vote has been recorded securely and anonymously.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your vote is encrypted and private</span>
          </div>
          <Button variant="outline" onClick={() => { setSubmitted(false); setVoted(null); }}>
            <Play className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Cast Your Vote
            </CardTitle>
            <CardDescription>President - Select one candidate</CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Demo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setVoted(candidate.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                voted === candidate.id 
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                  voted === candidate.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {candidate.photo}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                  <p className="text-sm text-muted-foreground">{candidate.department}</p>
                </div>
                {voted === candidate.id && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                    <CheckCircle className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full h-12 gap-2" 
          onClick={() => {
            if (!voted) {
              toast.error("Please select a candidate");
              return;
            }
            setSubmitted(true);
            toast.success("Demo: Vote cast successfully!");
          }}
          disabled={!voted}
        >
          <Vote className="h-5 w-5" />
          Submit Vote
        </Button>
      </CardContent>
    </Card>
  );
};

const DemoAspirantApplication = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    matric: "",
    department: "",
    level: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const stepInfo = [
    { num: 1, title: "Personal Info", icon: User },
    { num: 2, title: "Position", icon: Award },
    { num: 3, title: "Qualifications", icon: GraduationCap },
    { num: 4, title: "Submit", icon: CheckCircle },
  ];

  if (step === totalSteps) {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20 animate-fade-in">
        <CardContent className="pt-8 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Application Submitted!</h3>
          <p className="text-muted-foreground">Your application is now under review by the electoral committee.</p>
          <Button variant="outline" onClick={() => { setStep(1); setFormData({ fullName: "", matric: "", department: "", level: "" }); }}>
            <Play className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          {stepInfo.map((s) => {
            const Icon = s.icon;
            const isActive = s.num === step;
            const isCompleted = step > s.num;
            
            return (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
                  ${isCompleted ? 'bg-primary text-primary-foreground' : 
                    isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs hidden sm:block ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
        <CardTitle className="mt-4">
          {step === 1 && "Personal Information"}
          {step === 2 && "Select Position"}
          {step === 3 && "Qualifications"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Matric Number *</Label>
              <Input
                value={formData.matric}
                onChange={(e) => setFormData({ ...formData, matric: e.target.value })}
                placeholder="e.g., 21/08NUS014"
                className="h-12 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <select
                  className="w-full h-12 px-3 rounded-lg border border-input bg-background"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Nursing Sciences">Nursing Sciences</option>
                  <option value="Medicine and Surgery">Medicine and Surgery</option>
                  <option value="Human Anatomy">Human Anatomy</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Level *</Label>
                <select
                  className="w-full h-12 px-3 rounded-lg border border-input bg-background"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <Award className="h-4 w-4" />
              <AlertDescription>
                In the real application, you would select from available positions based on your eligibility.
              </AlertDescription>
            </Alert>
            <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">President</h4>
                  <p className="text-sm text-muted-foreground">Fee: ₦5,000 | Min CGPA: 3.5</p>
                </div>
                <CheckCircle className="ml-auto h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-4">
            <Alert>
              <GraduationCap className="h-4 w-4" />
              <AlertDescription>
                In the real application, you would enter your CGPA, leadership history, and upload documents.
              </AlertDescription>
            </Alert>
            <div className="p-4 border rounded-xl bg-muted/50 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGPA</span>
                <span className="font-semibold">4.25 / 5.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leadership Experience</span>
                <Badge>Class Rep 2022-2023</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <Badge variant="outline">3 files uploaded</Badge>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button 
            onClick={() => {
              if (step === 1 && (!formData.fullName || !formData.matric)) {
                toast.error("Please fill in all required fields");
                return;
              }
              setStep(step + 1);
              toast.success("Demo: Step completed!");
            }} 
            className="flex-1 gap-2"
          >
            {step === totalSteps - 1 ? "Submit" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Demo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "WebAuthn biometric & email OTP with 5-minute expiry",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    },
    {
      icon: IdCard,
      title: "Matric Validation",
      description: "Case-insensitive validation against student records",
      color: "bg-green-500/10 text-green-600 dark:text-green-400"
    },
    {
      icon: Lock,
      title: "Anonymous Voting",
      description: "Encrypted ballots with issuance token system",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      icon: Zap,
      title: "Real-time Results",
      description: "Live vote counting and result visualization",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO 
        title="Interactive Demo - Try ISECO Features" 
        description="Experience the ISECO election system in a sandbox environment. Try voter registration, voting simulation, and aspirant applications without affecting real data."
        keywords="ISECO demo, election system demo, voter registration demo, voting simulation, COHSSA"
      />
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <DualLogo logoSize="h-12 w-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interactive Demo
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Experience the ISECO election system features in a safe sandbox environment
          </p>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="registration" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14">
            <TabsTrigger value="registration" className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Voter Registration</span>
              <span className="sm:hidden">Register</span>
            </TabsTrigger>
            <TabsTrigger value="voting" className="flex items-center gap-2 text-sm">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Voting</span>
              <span className="sm:hidden">Vote</span>
            </TabsTrigger>
            <TabsTrigger value="aspirant" className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Aspirant Application</span>
              <span className="sm:hidden">Apply</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="mt-0">
            <DemoVoterRegistration />
          </TabsContent>

          <TabsContent value="voting" className="mt-0">
            <DemoVoting />
          </TabsContent>

          <TabsContent value="aspirant" className="mt-0">
            <DemoAspirantApplication />
          </TabsContent>
        </Tabs>

        {/* Features Grid */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-center mb-6">System Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-4 hover:shadow-lg transition-shadow">
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DualLogo logoSize="h-6 w-6" />
          </div>
          <p className="text-xs text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
        </div>
      </div>
    </div>
  );
};

export default Demo;
