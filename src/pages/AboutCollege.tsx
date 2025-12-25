import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, GraduationCap, Users, BookOpen, History, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";

// Import leader photos
import founderPhoto from "@/assets/leaders/founder.jpg";
import vcPhoto from "@/assets/leaders/vice-chancellor.jpg";
import registrarPhoto from "@/assets/leaders/registrar.jpg";
import hodMlsPhoto from "@/assets/leaders/hod-mls.jpg";
import hodAnatomyPhoto from "@/assets/leaders/hod-anatomy.jpg";

// Map leader names to their photos
const leaderPhotos: Record<string, string> = {
  "Alhaji (Chief) (Dr) AbdulRaheem Amoo Oladimeji, OFR, FNAEAP": founderPhoto,
  "Prof. L.F Oladimeji": vcPhoto,
  "Dr. Kazeem Adebayo Oladimeji": registrarPhoto,
  "Prof. S.K Babatunde": hodMlsPhoto,
  "Dr. B.J Dare": hodAnatomyPhoto,
};

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

  // Get photo for a leader (from static assets or database URL)
  const getLeaderPhoto = (leader: any) => {
    // First check if we have a static photo for this leader
    if (leaderPhotos[leader.name]) {
      return leaderPhotos[leader.name];
    }
    // Otherwise use the database photo_url
    return leader.photo_url;
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
                // Special layout for Founder - side by side with gold accents
                <div className="max-w-5xl mx-auto px-4">
                  {categoryLeaders.map((leader) => (
                    <div 
                      key={leader.id}
                      className="relative animate-fade-in"
                      style={{ animationDelay: `${350 + catIndex * 50}ms` }}
                    >
                      {/* Decorative gold corner accents */}
                      <div className="absolute -top-2 -left-2 w-16 h-16 border-l-4 border-t-4 border-amber-500/70 rounded-tl-lg" />
                      <div className="absolute -top-2 -right-2 w-16 h-16 border-r-4 border-t-4 border-amber-500/70 rounded-tr-lg" />
                      <div className="absolute -bottom-2 -left-2 w-16 h-16 border-l-4 border-b-4 border-amber-500/70 rounded-bl-lg" />
                      <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-4 border-b-4 border-amber-500/70 rounded-br-lg" />
                      
                      <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30 dark:from-amber-950/20 dark:via-background dark:to-amber-900/10 shadow-xl shadow-amber-500/10">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row items-stretch">
                            {/* Photo Section with gold frame */}
                            <div className="w-full md:w-2/5 flex-shrink-0 relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-amber-600/20" />
                              <div className="aspect-square md:aspect-[3/4] overflow-hidden">
                                {getLeaderPhoto(leader) ? (
                                  <img 
                                    src={getLeaderPhoto(leader)} 
                                    alt={leader.name} 
                                    className="w-full h-full object-cover object-top"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                                    <Award className="h-24 w-24 text-amber-500/50" />
                                  </div>
                                )}
                              </div>
                              {/* Gold ribbon accent */}
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
                            </div>
                            
                            {/* Info Section */}
                            <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center text-center md:text-left relative">
                              {/* Decorative gold line */}
                              <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-amber-500 to-transparent" />
                              
                              <div className="inline-flex items-center justify-center md:justify-start gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm uppercase tracking-widest mb-4">
                                <Award className="h-5 w-5" />
                                <span>Founder & Visionary</span>
                              </div>
                              <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-3 leading-tight">
                                {leader.name}
                              </h4>
                              <p className="text-lg text-amber-600 dark:text-amber-400 font-medium mb-4">{leader.position}</p>
                              {leader.bio && (
                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                  {leader.bio}
                                </p>
                              )}
                              
                              {/* Decorative divider */}
                              <div className="mt-6 flex items-center justify-center md:justify-start gap-2">
                                <div className="w-8 h-0.5 bg-amber-500/50" />
                                <Award className="h-4 w-4 text-amber-500/50" />
                                <div className="w-8 h-0.5 bg-amber-500/50" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                // Grid layout for other leaders - centered with flex
                <div className="flex justify-center">
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${categoryLeaders.length <= 3 ? '' : 'xl:grid-cols-4'} gap-6`}>
                    {categoryLeaders.map((leader, index) => (
                      <Card 
                        key={leader.id} 
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in w-full max-w-[280px]"
                        style={{ animationDelay: `${350 + catIndex * 50 + index * 50}ms` }}
                      >
                        <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                          {getLeaderPhoto(leader) ? (
                            <img 
                              src={getLeaderPhoto(leader)} 
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
