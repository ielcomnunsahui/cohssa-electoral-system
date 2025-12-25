import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, GraduationCap, Users, BookOpen, History, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";

const AboutCollege = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data } = await supabase
        .from('university_leaders')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (data) setLeaders(data);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group leaders by category
  const groupedLeaders = leaders.reduce((acc, leader) => {
    const category = leader.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(leader);
    return acc;
  }, {} as Record<string, any[]>);

  const categoryOrder = ['Founder', 'University Leadership', 'College Leadership', 'Faculty Leadership', 'Department Leadership'];

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
        title="About the College" 
        description="Learn about the College of Health Sciences at Al-Hikmah University, Ilorin. Discover our programs, faculty, and leadership."
        keywords="College of Health Sciences, Al-Hikmah University, Ilorin, Nigeria, medical education, nursing, anatomy"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <DualLogo className="h-10 w-auto" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About the College
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
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            College of Health Sciences
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Al-Hikmah University, Ilorin, Nigeria
          </p>
        </section>

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                About the College
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>
                  The College of Health Sciences at Al-Hikmah University is dedicated to producing world-class healthcare professionals 
                  who are equipped with the knowledge, skills, and ethical values needed to serve humanity.
                </p>
                <p>
                  Our college comprises multiple faculties including the Faculty of Nursing Sciences, Faculty of Basic Medical Sciences, 
                  and various departments offering cutting-edge programs in healthcare and medical sciences.
                </p>
                <p>
                  We pride ourselves on our state-of-the-art facilities, experienced faculty members, and a curriculum that combines 
                  theoretical knowledge with practical clinical experience. Our graduates are well-prepared to excel in their chosen 
                  healthcare careers both nationally and internationally.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Faculty History Section */}
        <section className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Card className="overflow-hidden border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Brief History of the Faculty
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                <p>
                  The Faculty of Health Sciences was established in the year 2018 through the combined efforts of the Founder, 
                  Alhaji Chief (Dr.) Raheem Oladimeji (OFR), the Council, Senate and Management of the Al-Hikmah University, 
                  under Prof. M.T.O Ibrahim as Vice-Chancellor. The pioneer Dean was Prof. D. B. Parakoyi from which Dr. M. J. Saka 
                  took over leadership of Faculty as Dean of the Faculty of Health Sciences.
                </p>
                <p>
                  The Management of the University successfully secured the National Universities Commission (NUC) Verification 
                  to commence Community Health and Medical Laboratory Science programmes in July 2018 after which Medical Laboratory 
                  Science Council of Nigeria (MLSCN) verified and approved commencement of trainings of professionals in Medical 
                  Laboratory Science.
                </p>
                <p>
                  The University went further to establish Anatomy, Nursing and Physiology Programmes via verification by the 
                  National Universities Commission (NUC) September, 2019.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Academic Programmes Section */}
        <section className="max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '280ms' }}>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Academic Programmes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Faculty of Basic Medical Sciences */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-primary mb-4">Faculty of Basic Medical Sciences</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-foreground">Department of Medical Laboratory Science</h5>
                    <p className="text-sm text-muted-foreground">• Medical Laboratory Science (BMLS)</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Department of Community Health</h5>
                    <p className="text-sm text-muted-foreground">• B.Sc. Public Health</p>
                    <p className="text-sm text-muted-foreground">• PGD Public Health</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Department of Human Anatomy</h5>
                    <p className="text-sm text-muted-foreground">• B.Sc. Anatomy</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Department of Human Physiology</h5>
                    <p className="text-sm text-muted-foreground">• B.Sc. Physiology</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Faculty of Nursing Sciences */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-primary mb-4">Faculty of Nursing Sciences</h4>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">• Department of Medical Surgical Nursing</p>
                  <p className="text-sm text-muted-foreground">• Department of Maternal and Child Health Nursing</p>
                  <p className="text-sm text-muted-foreground">• Department of Mental Health and Psychiatric Nursing</p>
                  <p className="text-sm text-muted-foreground">• Department of Public Health Nursing</p>
                  <p className="text-sm text-muted-foreground">• Department of Education, Administration and Research</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Leadership Sections by Category */}
        {categoryOrder.map((category, catIndex) => {
          const categoryLeaders = groupedLeaders[category];
          if (!categoryLeaders || categoryLeaders.length === 0) return null;

          return (
            <section key={category} className="mb-16">
              <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: `${300 + catIndex * 50}ms` }}>
                <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                  {category === 'Founder' ? <Award className="h-8 w-8 text-primary" /> : <Users className="h-8 w-8 text-primary" />}
                  {category}
                </h3>
                <p className="text-muted-foreground">
                  {category === 'Founder' && 'The visionary behind Al-Hikmah University'}
                  {category === 'University Leadership' && 'Leading Al-Hikmah University'}
                  {category === 'College Leadership' && 'College of Health Sciences leadership'}
                  {category === 'Faculty Leadership' && 'Faculty deans and leadership'}
                  {category === 'Department Leadership' && 'Heads of academic departments'}
                </p>
              </div>

              {category === 'Founder' ? (
                // Special layout for Founder
                <div className="max-w-4xl mx-auto">
                  {categoryLeaders.map((leader, index) => (
                    <Card 
                      key={leader.id} 
                      className="overflow-hidden animate-fade-in border-primary/30"
                      style={{ animationDelay: `${350 + catIndex * 50}ms` }}
                    >
                      <CardContent className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-shrink-0">
                            <div className="w-48 h-48 rounded-full overflow-hidden bg-muted mx-auto md:mx-0">
                              {leader.photo_url ? (
                                <img 
                                  src={leader.photo_url} 
                                  alt={leader.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Award className="h-20 w-20 text-primary/30" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-bold text-foreground mb-2">{leader.name}</h4>
                            <p className="text-lg text-primary font-medium mb-4">{leader.position}</p>
                            {leader.bio && (
                              <p className="text-muted-foreground leading-relaxed">{leader.bio}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Grid layout for other leaders
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${category === 'Department Leadership' ? 'xl:grid-cols-4' : 'xl:grid-cols-4'} gap-6`}>
                  {categoryLeaders.map((leader, index) => (
                    <Card 
                      key={leader.id} 
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                      style={{ animationDelay: `${350 + catIndex * 50 + index * 50}ms` }}
                    >
                      <div className="aspect-square overflow-hidden bg-muted">
                        {leader.photo_url ? (
                          <img 
                            src={leader.photo_url} 
                            alt={leader.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="h-20 w-20 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-bold text-foreground mb-1">{leader.name}</h4>
                        <p className="text-sm text-primary font-medium">{leader.position}</p>
                        {leader.faculty && (
                          <p className="text-xs text-muted-foreground mt-1">{leader.faculty}</p>
                        )}
                        {leader.department && (
                          <p className="text-xs text-muted-foreground mt-0.5">{leader.department}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {leaders.length === 0 && (
          <Card className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Leadership profiles coming soon</p>
              <p className="text-sm">The admin will add the university leaders' information shortly.</p>
            </CardContent>
          </Card>
        )}

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

export default AboutCollege;
