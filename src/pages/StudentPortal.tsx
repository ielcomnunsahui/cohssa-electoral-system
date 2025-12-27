import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, ExternalLink, GraduationCap, BookOpen, CreditCard, Library
} from "lucide-react";
import { Logo } from "@/components/NavLink";

const universityPortals = [
  {
    title: "Student Results Portal",
    description: "Check your academic results, transcripts, and course grades",
    icon: GraduationCap,
    url: "https://portal.alhikmah.edu.ng/students/",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hoverBg: "hover:bg-blue-500/20",
    borderColor: "border-blue-500/20 hover:border-blue-500/40"
  },
  {
    title: "Al-Hikmah Payment Portal",
    description: "Pay fr your school fees,Course forms, view payment history, and generate receipts",
    icon: CreditCard,
    url: "https://ecampus.alhikmahuniversity.edu.ng/portal/",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    hoverBg: "hover:bg-green-500/20",
    borderColor: "border-green-500/20 hover:border-green-500/40"
  },
  {
    title: "E-Library Portal",
    description: "Access digital books, journals, research materials, and academic resources",
    icon: Library,
    url: "https://alhikmahuniversity.edu.ng/new/#",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    hoverBg: "hover:bg-purple-500/20",
    borderColor: "border-purple-500/20 hover:border-purple-500/40"
  }
];

const StudentPortal = () => {
  const navigate = useNavigate();

  const handleOpenPortal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 animate-fade-in">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Student Portal
              </h1>
              <p className="text-sm text-muted-foreground">Al-Hikmah University Quick Links</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Access University Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quick access to Al-Hikmah University's official portals for academic results, fee payments, and digital library resources.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {universityPortals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <Card 
                key={portal.title}
                className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in border-2 ${portal.borderColor}`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
                onClick={() => handleOpenPortal(portal.url)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 rounded-2xl ${portal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {portal.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {portal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Open Portal
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <Card className="max-w-3xl mx-auto bg-muted/50 border-dashed animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> These links redirect to official Al-Hikmah University portals. 
              Make sure you have your student credentials ready before accessing these services.
            </p>
          </CardContent>
        </Card>

        {/* Quick Link to COHSSA Portal */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-sm text-muted-foreground mb-4">
            Looking for academic resources, past questions, and marketplace?
          </p>
          <Button variant="outline" onClick={() => navigate("/cohssa-portal")} className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Visit COHSSA Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
