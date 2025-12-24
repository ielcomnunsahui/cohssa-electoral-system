import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MessageCircle, Mail, Phone, HelpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { DualLogo } from "@/components/NavLink";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "2347040640646";
const SUPPORT_EMAIL = "cohssahuiiseco@gmail.com";

type IssueType = 
  | "otp_not_received"
  | "login_failed"
  | "registration_issue"
  | "voting_issue"
  | "account_locked"
  | "biometric_failed"
  | "other";

const issueTemplates: Record<IssueType, { subject: string; template: string }> = {
  otp_not_received: {
    subject: "OTP Code Not Received",
    template: `Hello ISECO Support,

I am having trouble receiving my OTP code.

Details:
- Matric Number: [YOUR_MATRIC]
- Email: [YOUR_EMAIL]
- Issue: I have not received my OTP code after multiple attempts.
- Time of last attempt: [TIME]

Please help me access my voter account.

Thank you.`
  },
  login_failed: {
    subject: "Unable to Login",
    template: `Hello ISECO Support,

I am unable to login to my voter account.

Details:
- Matric Number: [YOUR_MATRIC]
- Error Message: [ERROR_MESSAGE]
- Browser: [BROWSER_NAME]

Please help resolve this issue.

Thank you.`
  },
  registration_issue: {
    subject: "Voter Registration Problem",
    template: `Hello ISECO Support,

I am experiencing issues with voter registration.

Details:
- Matric Number: [YOUR_MATRIC]
- Name: [YOUR_NAME]
- Department: [YOUR_DEPARTMENT]
- Issue: [DESCRIBE_ISSUE]

Please assist with my registration.

Thank you.`
  },
  voting_issue: {
    subject: "Problem While Voting",
    template: `Hello ISECO Support,

I encountered a problem while trying to cast my vote.

Details:
- Matric Number: [YOUR_MATRIC]
- Issue: [DESCRIBE_ISSUE]
- Position I was voting for: [POSITION]

Please help me complete my vote.

Thank you.`
  },
  account_locked: {
    subject: "Account Locked - Request Unlock",
    template: `Hello ISECO Support,

My voter account appears to be locked.

Details:
- Matric Number: [YOUR_MATRIC]
- Email: [YOUR_EMAIL]
- Reason (if known): Too many failed login attempts

Please help unlock my account so I can vote.

Thank you.`
  },
  biometric_failed: {
    subject: "Biometric Authentication Failed",
    template: `Hello ISECO Support,

My biometric login is not working.

Details:
- Matric Number: [YOUR_MATRIC]
- Device: [DEVICE_TYPE]
- Issue: Fingerprint/Face recognition not recognized

Please help me access my account using alternative methods.

Thank you.`
  },
  other: {
    subject: "Voter Support Request",
    template: `Hello ISECO Support,

I need assistance with my voter account.

Details:
- Matric Number: [YOUR_MATRIC]
- Issue: [DESCRIBE_YOUR_ISSUE]

Please help.

Thank you.`
  }
};

const issueLabels: Record<IssueType, string> = {
  otp_not_received: "OTP Code Not Received",
  login_failed: "Unable to Login",
  registration_issue: "Registration Problem",
  voting_issue: "Problem While Voting",
  account_locked: "Account Locked",
  biometric_failed: "Biometric Not Working",
  other: "Other Issue"
};

const VoterHelpDesk = () => {
  const navigate = useNavigate();
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [matric, setMatric] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const getFilledTemplate = () => {
    if (!issueType) return "";
    let template = issueTemplates[issueType].template;
    template = template.replace("[YOUR_MATRIC]", matric || "[YOUR_MATRIC]");
    template = template.replace("[YOUR_EMAIL]", email || "[YOUR_EMAIL]");
    return template;
  };

  const handleWhatsAppContact = () => {
    if (!issueType) {
      toast.error("Please select an issue type first");
      return;
    }
    
    const template = message || getFilledTemplate();
    const encodedMessage = encodeURIComponent(template);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleEmailContact = () => {
    if (!issueType) {
      toast.error("Please select an issue type first");
      return;
    }
    
    const template = message || getFilledTemplate();
    const subject = encodeURIComponent(issueTemplates[issueType].subject);
    const body = encodeURIComponent(template);
    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    toast.success("Opening email client...");
  };

  const handleIssueChange = (value: IssueType) => {
    setIssueType(value);
    setMessage(issueTemplates[value].template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO 
        title="Voter Help Desk" 
        description="Get support from the ISECO Electoral Committee for voting issues, OTP problems, and account assistance."
        keywords="voter support, ISECO help, election support, OTP help, voting assistance"
      />
      
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-2xl px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Voter Help Desk</CardTitle>
            <CardDescription>
              Get assistance from the Electoral Committee
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Quick Contact Info */}
            <Alert className="border-primary/30 bg-primary/5">
              <Phone className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-1">
                <span className="font-medium">Emergency Contact:</span>
                <span>WhatsApp: +234 704 064 0646</span>
                <span>Email: {SUPPORT_EMAIL}</span>
              </AlertDescription>
            </Alert>

            {/* Issue Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="issue-type" className="text-base font-medium">
                What issue are you experiencing?
              </Label>
              <Select value={issueType} onValueChange={(v) => handleIssueChange(v as IssueType)}>
                <SelectTrigger id="issue-type" className="h-12">
                  <SelectValue placeholder="Select your issue" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(issueLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Your Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="matric">Matric Number</Label>
                <Input
                  id="matric"
                  placeholder="e.g., 21/08NUS014"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Message Template */}
            {issueType && (
              <div className="space-y-2">
                <Label htmlFor="message" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Message (Edit as needed)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Replace the [PLACEHOLDER] text with your actual information
                </p>
              </div>
            )}

            {/* Contact Buttons */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={handleWhatsAppContact}
                className="h-14 text-base gap-3 bg-green-600 hover:bg-green-700"
                disabled={!issueType}
              >
                <MessageCircle className="h-5 w-5" />
                Contact via WhatsApp
              </Button>
              <Button
                onClick={handleEmailContact}
                variant="outline"
                className="h-14 text-base gap-3"
                disabled={!issueType}
              >
                <Mail className="h-5 w-5" />
                Send Email
              </Button>
            </div>

            {/* Tips */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Response Times:</strong> WhatsApp messages are typically answered within 30 minutes during election hours (8AM - 6PM). Email responses may take 2-4 hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
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

export default VoterHelpDesk;
