import { useState, useEffect } from "react";
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
  ArrowRight,
  Shield,
  Play,
  IdCard,
  User,
  GraduationCap,
  Award,
  Clock,
  Lock,
  Zap,
  Smartphone,
  Trophy
} from "lucide-react";
import { DualLogo } from "@/components/NavLink";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";

const MATRIC_REGEX = /^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/;

type Step = 'matric' | 'email' | 'verify_choice' | 'biometric' | 'otp' | 'success';

const DemoVoterRegistration = () => {
  const [currentStep, setCurrentStep] = useState<Step>('matric');
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [matricError, setMatricError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ matric: string; name: string; department: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [biometricSetupDone, setBiometricSetupDone] = useState(false);

  const steps = [
    { id: 'matric', label: 'Matric', icon: IdCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'verify_choice', label: 'Verify', icon: Shield },
    { id: 'success', label: 'Done', icon: CheckCircle },
  ];

  const getStepIndex = (step: Step) => {
    if (step === 'biometric' || step === 'otp') return 2;
    const idx = steps.findIndex(s => s.id === step);
    return idx === -1 ? steps.length : idx;
  };

  const progress = ((getStepIndex(currentStep) + 1) / steps.length) * 100;

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

  if (currentStep === 'success') {
    return (
      <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20 animate-fade-in">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Registration Complete!</h3>
          <p className="text-muted-foreground text-sm">
            {biometricSetupDone ? "Biometric enabled for quick login." : "Email verified successfully."} Your account is pending admin approval.
          </p>
          <Button variant="outline" onClick={() => { setCurrentStep('matric'); setMatric(""); setEmail(""); setOtp(""); setStudentInfo(null); setBiometricSetupDone(false); }}>
            <Play className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep || (currentStep === 'biometric' && step.id === 'verify_choice') || (currentStep === 'otp' && step.id === 'verify_choice');
            const isCompleted = getStepIndex(currentStep) > index;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isCompleted ? 'bg-primary text-primary-foreground' : 
                    isActive ? 'bg-primary/20 text-primary border-2 border-primary' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted && !isActive ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step: Matric */}
      {currentStep === 'matric' && (
        <Card className="animate-fade-in shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <IdCard className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Enter Your Matric Number</CardTitle>
            <CardDescription>We'll verify you're a registered student</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-primary/30 bg-primary/5">
              <User className="h-4 w-4" />
              <AlertDescription>
                Enter your matric number exactly as on your student ID (e.g., 21/08NUS014).
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label className="text-base font-medium">Matric Number</Label>
              <Input
                placeholder="e.g., 21/08NUS014"
                value={matric}
                onChange={(e) => validateMatric(e.target.value)}
                className={`h-14 text-lg text-center font-mono ${matricError ? 'border-destructive' : ''}`}
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
                setStudentInfo({ matric, name: "Demo Student", department: "Medicine and Surgery" });
                setCurrentStep('email');
              }}
              disabled={!!matricError || !matric}
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Email */}
      {currentStep === 'email' && studentInfo && (
        <Card className="animate-fade-in shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Add Your Email</CardTitle>
            <CardDescription>You'll use this to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{studentInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{studentInfo.matric} • {studentInfo.department}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Email Address</Label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('matric')} className="flex-1">
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
                  setCurrentStep('verify_choice');
                }}
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Verification Choice */}
      {currentStep === 'verify_choice' && (
        <Card className="animate-fade-in shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Choose Verification Method</CardTitle>
            <CardDescription>How would you like to verify your account?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Biometric Option */}
            <button
              onClick={() => setCurrentStep('biometric')}
              className="w-full p-5 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Fingerprint className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg flex items-center gap-2">
                    Biometric Setup
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID for quick, secure login</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* OTP Option */}
            <button
              onClick={() => {
                toast.success("Demo: Verification code sent!");
                setCurrentStep('otp');
              }}
              className="w-full p-5 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-muted/50 transition-all duration-300 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">Email OTP Verification</p>
                  <p className="text-sm text-muted-foreground">Receive a 6-digit code via email</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            <Button variant="ghost" onClick={() => setCurrentStep('email')} className="w-full mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Biometric */}
      {currentStep === 'biometric' && (
        <Card className="animate-fade-in shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Fingerprint className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Set Up Biometric Login</CardTitle>
            <CardDescription>Use fingerprint or face ID for secure access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-primary/30 bg-primary/5">
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                This is a demo. In production, this uses WebAuthn for secure biometric authentication.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => { 
                toast.success("Demo: Biometric registered!"); 
                setBiometricSetupDone(true);
                setCurrentStep('success'); 
              }} 
              className="w-full h-16 text-lg gap-3"
            >
              <Fingerprint className="h-6 w-6" />
              Set Up Biometric (Demo)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                toast.success("Demo: Verification code sent!");
                setCurrentStep('otp');
              }}
              className="w-full h-12 gap-2"
            >
              <Mail className="h-5 w-5" />
              Use Email OTP Instead
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: OTP */}
      {currentStep === 'otp' && (
        <Card className="animate-fade-in shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>Enter the 6-digit code (use any digits for demo)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-xs text-center text-muted-foreground">Code expires in 5 minutes</p>
            <Button 
              className="w-full h-12 gap-2" 
              onClick={() => {
                if (otp.length !== 6) {
                  toast.error("Please enter 6 digits");
                  return;
                }
                toast.success("Demo: Email verified!");
                setCurrentStep('success');
              }}
              disabled={otp.length !== 6}
            >
              Verify & Complete
              <CheckCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={() => setCurrentStep('verify_choice')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
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
    <Card className="animate-fade-in shadow-lg border-0">
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

const DemoLiveResults = () => {
  const [results, setResults] = useState([
    {
      position: "President",
      candidates: [
        { name: "Adebayo Johnson", votes: 145, percentage: 48.3 },
        { name: "Fatima Ibrahim", votes: 98, percentage: 32.7 },
        { name: "Emmanuel Okonkwo", votes: 57, percentage: 19.0 },
      ],
      total: 300
    },
    {
      position: "Vice President",
      candidates: [
        { name: "Grace Obi", votes: 167, percentage: 55.7 },
        { name: "Samuel Adeyemi", votes: 133, percentage: 44.3 },
      ],
      total: 300
    },
    {
      position: "General Secretary",
      candidates: [
        { name: "Mary Eze", votes: 189, percentage: 63.0 },
        { name: "John Okoro", votes: 111, percentage: 37.0 },
      ],
      total: 300
    },
  ]);

  const [isLive, setIsLive] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setResults(prev => prev.map(pos => {
        const newCandidates = pos.candidates.map(c => {
          const newVotes = c.votes + Math.floor(Math.random() * 3);
          return { ...c, votes: newVotes };
        });
        const newTotal = newCandidates.reduce((sum, c) => sum + c.votes, 0);
        return {
          ...pos,
          candidates: newCandidates.map(c => ({
            ...c,
            percentage: (c.votes / newTotal) * 100
          })).sort((a, b) => b.votes - a.votes),
          total: newTotal
        };
      }));
      setUpdateCount(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const totalVoters = 450;
  const votedCount = results[0]?.total || 0;
  const turnout = ((votedCount / totalVoters) * 100).toFixed(1);

  return (
    <Card className="animate-fade-in shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Live Election Results
            </CardTitle>
            <CardDescription>Real-time vote counting demo</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isLive ? (
              <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/30 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">Paused</Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              {updateCount} updates
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-2xl font-bold text-primary">{totalVoters}</p>
            <p className="text-xs text-muted-foreground">Registered</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-2xl font-bold text-green-600">{votedCount}</p>
            <p className="text-xs text-muted-foreground">Voted</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-2xl font-bold text-amber-600">{turnout}%</p>
            <p className="text-xs text-muted-foreground">Turnout</p>
          </div>
        </div>

        {/* Results by Position */}
        <div className="space-y-4">
          {results.map((position) => (
            <div key={position.position} className="p-4 border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{position.position}</h4>
                <Badge variant="outline">{position.total} votes</Badge>
              </div>
              {position.candidates.map((candidate, idx) => (
                <div key={candidate.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Trophy className="h-4 w-4 text-amber-500" />}
                      <span className={idx === 0 ? "font-semibold" : ""}>{candidate.name}</span>
                    </div>
                    <span className="font-mono">{candidate.votes} ({candidate.percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={candidate.percentage} className={idx === 0 ? "h-3" : "h-2"} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            variant={isLive ? "destructive" : "default"} 
            onClick={() => setIsLive(!isLive)}
            className="flex-1"
          >
            {isLive ? "Pause Updates" : "Resume Updates"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setUpdateCount(0);
              toast.success("Demo: Counter reset!");
            }}
          >
            Reset Counter
          </Button>
        </div>
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
    <Card className="animate-fade-in shadow-lg border-0">
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 transition-colors duration-300">
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
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>

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
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14">
            <TabsTrigger value="registration" className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Register</span>
            </TabsTrigger>
            <TabsTrigger value="voting" className="flex items-center gap-2 text-sm">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Vote</span>
              <span className="sm:hidden">Vote</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
            <TabsTrigger value="aspirant" className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Apply</span>
              <span className="sm:hidden">Apply</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="mt-0">
            <DemoVoterRegistration />
          </TabsContent>

          <TabsContent value="voting" className="mt-0">
            <DemoVoting />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <DemoLiveResults />
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
