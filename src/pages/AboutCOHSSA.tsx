import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Users, Crown, Scale, History, Phone, Mail, GraduationCap, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";

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
        supabase.from('cohssa_executives').select('*').order('display_order', { ascending: true }),
        supabase.from('cohssa_senate').select('*').order('display_order', { ascending: true }),
        supabase.from('cohssa_alumni').select('*').order('administration_number', { ascending: true })
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
        description="Learn about the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University. Meet the executives, senate, and alumni."
        keywords="COHSSA, College of Health Sciences, Al-Hikmah University, student association, executives, senate"
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
            College of Health Sciences Students Association
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            COHSSA - The Voice of Health Science Students
          </p>
        </section>

        {/* Historical Background */}
        <section className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Historical Background
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>
                  The College of Health Sciences Students Association (COHSSA) was established as the umbrella body 
                  representing all students of the College of Health Sciences at Al-Hikmah University.
                </p>
                <p>
                  Since its inception, COHSSA has been at the forefront of student advocacy, academic excellence, 
                  and the promotion of unity among health science students. The association serves as a bridge 
                  between students and the university administration, ensuring that student voices are heard.
                </p>
                <p>
                  Through various programs, events, and initiatives, COHSSA continues to foster leadership, 
                  academic excellence, and social responsibility among its members, preparing them to become 
                  outstanding healthcare professionals.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs for Council Members */}
        <Tabs defaultValue="executives" className="mb-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
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

          {/* Executive Council */}
          <TabsContent value="executives">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Executive Council</h3>
              <p className="text-muted-foreground">The 16-member executive team leading COHSSA</p>
            </div>
            <MemberGrid members={executives} type="executive" />
          </TabsContent>

          {/* Senate Council */}
          <TabsContent value="senate">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold">Senate Council</h3>
              <p className="text-muted-foreground">The 10-member legislative body of COHSSA</p>
            </div>
            <MemberGrid members={senate} type="senate" />
          </TabsContent>

          {/* Alumni */}
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
              {member.contact && (
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {member.contact}
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
                <div className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mb-2">
                  {alum.administration_number}{getOrdinalSuffix(alum.administration_number)} Administration
                </div>
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
              {alum.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  {alum.phone}
                </p>
              )}
              {alum.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  {alum.email}
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
