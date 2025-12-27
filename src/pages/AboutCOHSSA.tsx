import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, ArrowLeft, Users, Crown, Scale, History, Phone, Mail, 
  GraduationCap, Building, Fingerprint, Database, Vote, Shield, 
  Target, BookOpen, Heart, Sparkles, Calendar 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";

// COHSSA Departments
const DEPARTMENTS = [
  { name: "Medicine and Surgery (MBBS)", icon: "🩺" },
  { name: "Nursing Science", icon: "💉" },
  { name: "Medical Laboratory Science", icon: "🔬" },
  { name: "Public Health", icon: "🏥" },
  { name: "Human Anatomy", icon: "🦴" },
  { name: "Physiology", icon: "❤️" }
];

// Administration History
const ADMINISTRATIONS = [
  {
    number: 1,
    title: "First Administration – RAFIU NAFIU (Pioneer)",
    period: "2019",
    president: "RAFIU NAFIU",
    vicePresident: "ADAMU MURINANATU",
    senateLeader: "HABEEB MUHAMMAD KUDU (Speaker)",
    staffAdviser: "MR. AKEEM BUSARI",
    highlights: [
      "Foundation of the association's governance structure",
      "Drafting and establishment of the first AHSS constitution",
      "Pioneer President served two terms"
    ]
  },
  {
    number: 2,
    title: "Second Administration – IBRAHIM MARINASARA",
    president: "IBRAHIM MARINASARA",
    senateLeader: "YAHAYA BILIKISU OWUNA (First Senate President)",
    staffAdviser: "MR. AKEEM BUSARI",
    highlights: [
      "Formal institutionalization of Senate Presidency",
      "Student population grew to approximately 500",
      "Formation and representation in Council of Faculty Presidents",
      "Architect of the Health Fest initiative"
    ]
  },
  {
    number: 3,
    title: "Third Administration – KAMALDEEN MAHMOOD",
    president: "KAMALDEEN MAHMOOD",
    staffAdviser: "MR. SALAUDEEN FATAI",
    highlights: [
      "Student population expanded to over 1,000",
      "Focus on continuity, consolidation, and institutional growth",
      "Staff adviser changed to MR. SALAUDEEN FATAI",
      "Preservation and strengthening of existing legacies"
    ]
  },
  {
    number: 4,
    title: "Fourth Administration – ABDULQANIYU ABDULAZEEZ",
    president: "ABDULQANIYU ABDULAZEEZ",
    senateLeader: "ISMAEEL IBRAHEEM (First Elected Senate President)",
    staffAdviser: "MR. I. A. LAWAL",
    highlights: [
      "Student population grew to approximately 2,000",
      "First elected Senate President in AHSS history",
      "First successful amendment of the AHSS constitution",
      "Numerous impactful programs elevating faculty profile",
      "Regarded as one of the most successful tenures"
    ]
  },
  {
    number: 5,
    title: "Fifth Administration – OSHAFU SALEEM (Current)",
    period: "2025",
    president: "OSHAFU SALEEM",
    senateLeader: "OYENIYI ABDULAZEEZ (Senate President)",
    highlights: [
      "Introduction of Medicine and Surgery (MBBS) programme",
      "First inclusion of MBBS students",
      "Faculty restructured to College under Prof. Enoch A. Afolayan",
      "Constitutional name change from AHSS to COHSSA (December 2025)",
      "Digital Revolution implementation"
    ]
  }
];

// Core Objectives
const CORE_OBJECTIVES = [
  {
    title: "Advocacy",
    description: "To represent the interests of health science students before the University Management.",
    icon: Shield
  },
  {
    title: "Professionalism",
    description: "To instill the ethics of healthcare delivery in students through seminars, workshops, and the annual Health Fest.",
    icon: BookOpen
  },
  {
    title: "Unity",
    description: "To bridge the gap between various medical and health disciplines, fostering a collaborative healthcare team mindset before graduation.",
    icon: Heart
  },
  {
    title: "Excellence",
    description: "To reward and encourage academic and clinical brilliance among its members.",
    icon: Target
  }
];

const AboutCOHSSA = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [executives, setExecutives] = useState<any[]>([]);
  const [senate, setSenate] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [execRes, senateRes, alumniRes] = await Promise.all([
        supabase.from('cohssa_executives_public').select('*').order('display_order', { ascending: true }),
        supabase.from('cohssa_senate_public').select('*').order('display_order', { ascending: true }),
        supabase.from('cohssa_alumni_public').select('*').order('administration_number', { ascending: true })
      ]);

      if (execRes.data) setExecutives(execRes.data);
      if (senateRes.data) setSenate(senateRes.data);
      if (alumniRes.data) setAlumni(alumniRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEO 
        title="About COHSSA" 
        description="Learn about the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University. The apex student regulatory body for health science students."
        keywords="COHSSA, AHSS, College of Health Sciences, Al-Hikmah University, student association, Health First, ISECO"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <DualLogo className="h-10 w-auto" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About COHSSA
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Crown className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            College of Health Sciences Students' Association
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            The apex student regulatory and representative body for all students within the College of Health Sciences at Al-Hikmah University, Ilorin.
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2 border-primary text-primary">
            <Heart className="h-4 w-4 mr-2 inline" />
            Motto: "Health First"
          </Badge>
        </section>

        {/* Institutional Mandate Section */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                Institutional Mandate & Identity
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                COHSSA serves as the constitutionally recognized umbrella association for students across all departments within the College, operating under the authority of the University Administration and the College Provost.
              </p>
              
              <h4 className="font-semibold mb-4 text-lg">Constituent Departments:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {DEPARTMENTS.map((dept, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-2xl">{dept.icon}</span>
                    <span className="font-medium text-sm">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Chronicles of Evolution */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Chronicles of Evolution
              </h3>
              
              {/* Foundation */}
              <div className="mb-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  The Foundation (2019)
                </h4>
                <p className="text-muted-foreground mb-4">
                  The association was birthed in 2019 following the creation of the Faculty of Health Sciences. Originally established as the <strong>Faculty of Health Science Students (FHSS)</strong>, it began with a pioneer community of fewer than 100 students.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Pioneer President:</span>
                    <p className="font-semibold">RAFIU NAFIU</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Pioneer Vice President:</span>
                    <p className="font-semibold">ADAMU MURINANATU</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground">Pioneer General Secretary:</span>
                    <p className="font-semibold">BOLARINWA BADMUS KOREDE</p>
                    <p className="text-xs text-muted-foreground">(Designer of original insignia)</p>
                  </div>
                </div>
              </div>

              {/* Administrations Accordion */}
              <h4 className="text-xl font-bold mb-4">The AHSS Era & Institutionalization</h4>
              <Accordion type="single" collapsible className="space-y-3">
                {ADMINISTRATIONS.map((admin) => (
                  <AccordionItem key={admin.number} value={`admin-${admin.number}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                          {admin.number}
                        </Badge>
                        <span className="font-semibold text-left">{admin.title}</span>
                        {admin.number === 5 && (
                          <Badge className="bg-primary text-primary-foreground ml-2">Current</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">President:</span> <strong>{admin.president}</strong></p>
                          {admin.vicePresident && (
                            <p><span className="text-muted-foreground">Vice President:</span> <strong>{admin.vicePresident}</strong></p>
                          )}
                          {admin.senateLeader && (
                            <p><span className="text-muted-foreground">Senate Leader:</span> <strong>{admin.senateLeader}</strong></p>
                          )}
                          {admin.staffAdviser && (
                            <p><span className="text-muted-foreground">Staff Adviser:</span> <strong>{admin.staffAdviser}</strong></p>
                          )}
                        </div>
                      </div>
                      <h5 className="font-semibold mb-2 text-sm">Key Highlights:</h5>
                      <ul className="space-y-1">
                        {admin.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Governance Structure */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Scale className="h-6 w-6 text-primary" />
                Governance Structure
              </h3>
              <p className="text-muted-foreground mb-6">
                COHSSA operates through a system of checks and balances designed to foster transparent leadership:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Crown className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h4 className="font-bold mb-2">The Executive Council</h4>
                    <p className="text-sm text-muted-foreground">
                      The administrative arm responsible for day-to-day running and implementation of student welfare programs.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Scale className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h4 className="font-bold mb-2">HSSRC (The Senate)</h4>
                    <p className="text-sm text-muted-foreground">
                      Health Sciences Students Representative Council – legislative arm for law-making, budgetary approvals, and oversight.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Vote className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h4 className="font-bold mb-2">ISECO</h4>
                    <p className="text-sm text-muted-foreground">
                      Independent Students Electoral Committee – autonomous body mandated to conduct free, fair, and credible elections.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Digital Transformation */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                The Digital Transformation
              </h3>
              <p className="text-muted-foreground mb-6 text-lg">
                In late 2025, under the leadership of ISECO Chairman <strong>AWWAL ABUBAKAR SADIK</strong>, the association embraced a "Digital Revolution." COHSSA became a pioneer in student governance by implementing:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <Fingerprint className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Biometric Voter Verification</h4>
                    <p className="text-sm text-muted-foreground">Ensuring the integrity of the "One Student, One Vote" principle.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <Database className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Database Integration</h4>
                    <p className="text-sm text-muted-foreground">Aligning electoral records directly with the College's official student database.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <Vote className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Transparency Portals</h4>
                    <p className="text-sm text-muted-foreground">Digital manifestation of candidate profiles and real-time result processing.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core Objectives */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Core Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {CORE_OBJECTIVES.map((objective, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <objective.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{objective.title}</h4>
                      <p className="text-sm text-muted-foreground">{objective.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary italic">
                  "Health First, Leadership Always."
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs for Council Members */}
        <Tabs defaultValue="executives" className="mb-16 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="executives" className="gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Executives</span>
            </TabsTrigger>
            <TabsTrigger value="senate" className="gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Senate</span>
            </TabsTrigger>
            <TabsTrigger value="alumni" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Alumni</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executives">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Executive Council</h3>
              <p className="text-muted-foreground">The 16-member executive team leading COHSSA</p>
            </div>
            <MemberGrid members={executives} type="executive" />
          </TabsContent>

          <TabsContent value="senate">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Senate Council (HSSRC)</h3>
              <p className="text-muted-foreground">The Health Sciences Students Representative Council</p>
            </div>
            <MemberGrid members={senate} type="senate" />
          </TabsContent>

          <TabsContent value="alumni">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Alumni Presidents & Senate Leaders</h3>
              <p className="text-muted-foreground">Past leaders from 1st to 5th Administration</p>
            </div>
            <AlumniGrid alumni={alumni} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 border-t animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-foreground">ISECO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powering the Digital Revolution in Student Governance
          </p>
        </footer>
      </div>
    </div>
  );
};

const MemberGrid = ({ members, type }: { members: any[]; type: string }) => {
  if (members.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">
            {type === 'executive' ? 'Executive Council' : 'Senate Council'} profiles coming soon
          </p>
          <p className="text-sm">The admin will add member information shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map((member, index) => (
        <Card 
          key={member.id} 
          className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="aspect-square overflow-hidden bg-muted">
            {member.photo_url ? (
              <img 
                src={member.photo_url} 
                alt={member.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h4 className="font-bold text-foreground mb-1">{member.name}</h4>
            <p className="text-sm text-primary font-medium mb-2">{member.position}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {member.department && (
                <p className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {member.department}
                </p>
              )}
              {member.level && (
                <p className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {member.level}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const AlumniGrid = ({ alumni }: { alumni: any[] }) => {
  if (alumni.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center text-muted-foreground">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Alumni profiles coming soon</p>
          <p className="text-sm">The admin will add alumni information shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map((alum, index) => (
        <Card 
          key={alum.id} 
          className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0">
                {alum.photo_url ? (
                  <img 
                    src={alum.photo_url} 
                    alt={alum.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className="mb-2">
                  {alum.administration_number}{getOrdinalSuffix(alum.administration_number)} Administration
                </Badge>
                <h4 className="font-bold text-foreground">{alum.name}</h4>
                <p className="text-sm text-primary font-medium">{alum.position}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
              {alum.department && (
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4 shrink-0" />
                  {alum.department}
                </p>
              )}
              {alum.graduation_year && (
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 shrink-0" />
                  Class of {alum.graduation_year}
                </p>
              )}
              {alum.current_workplace && (
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4 shrink-0" />
                  {alum.current_workplace}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export default AboutCOHSSA;
