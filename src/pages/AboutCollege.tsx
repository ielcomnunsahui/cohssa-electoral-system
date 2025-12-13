import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, GraduationCap, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12" />
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

        {/* Leadership Section */}
        <section className="mb-16">
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              University Leadership
            </h3>
            <p className="text-muted-foreground">Meet the distinguished leaders of our institution</p>
          </div>

          {leaders.length === 0 ? (
            <Card className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Leadership profiles coming soon</p>
                <p className="text-sm">The admin will add the university leaders' information shortly.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {leaders.map((leader, index) => (
                <Card 
                  key={leader.id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

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
