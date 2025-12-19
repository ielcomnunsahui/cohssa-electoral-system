import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Mail, Phone, Clock, HelpCircle, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo, DualLogo } from "@/components/NavLink";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject too long"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000, "Message too long"),
});

const faqs = [
  {
    question: "How do I register as a voter?",
    answer: "To register as a voter, navigate to the 'Register as Voter' page from the homepage. You'll need your matric number and student email. Make sure voter registration is currently open by checking the election timeline."
  },
  {
    question: "What are the requirements to run for a position?",
    answer: "Requirements vary by position but generally include: minimum CGPA requirements, specific academic levels, and departmental eligibility. Visit the 'Apply as Candidate' section to see detailed requirements for each position."
  },
  {
    question: "How do I apply as a candidate?",
    answer: "Click on 'Apply as Candidate' on the homepage when the application period is open. You'll need to create an account, fill out the application form, provide required documents, and pay the application fee."
  },
  {
    question: "When will voting take place?",
    answer: "Voting dates are announced by the Electoral Committee. Check the election timeline on the homepage for exact dates. You'll receive notifications when voting opens."
  },
  {
    question: "How is my vote kept secret?",
    answer: "Your vote is completely anonymous. The system uses token-based voting where your identity is separated from your vote. No one, including administrators, can link your vote to your identity."
  },
  {
    question: "I forgot my login credentials. What should I do?",
    answer: "Use the 'Forgot Password' option on the login page. An OTP will be sent to your registered email. If you continue to have issues, contact the Electoral Committee directly."
  },
  {
    question: "Can I change my vote after submitting?",
    answer: "No, once a vote is submitted it cannot be changed. Please review your selections carefully before final submission."
  },
  {
    question: "Who can I contact for technical issues?",
    answer: "For technical support, use the contact form below or reach out to the Electoral Committee through the provided contact channels."
  }
];

const Support = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    
    // Simulate sending - in production, this would be an edge function
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSending(false);
    setSent(true);
    toast.success("Message sent successfully! We'll get back to you soon.");
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSent(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title="Support Center" 
        description="Get help with COHSSA elections at Al-Hikmah University. Find answers to FAQs, contact the electoral committee, or submit a support request."
        keywords="support, help, FAQ, COHSSA elections, Al-Hikmah University, contact"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in">
          <DualLogo className="h-10 w-auto" />
          <div className="flex-1" />
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-xl text-muted-foreground">Get help with your election questions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* FAQ Section */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground">iseco@alhikmah.edu.ng</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  const message = encodeURIComponent("Hello ISECO Support,\n\nI need help with:\n\nName:\nMatric Number:\nIssue Description:\n\nThank you.");
                  window.open(`https://wa.me/2347040640646?text=${message}`, '_blank');
                }}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">07040640646</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-sm text-muted-foreground">Mon - Fri: 9AM - 5PM</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Contact Us
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@student.edu"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={sending}>
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
