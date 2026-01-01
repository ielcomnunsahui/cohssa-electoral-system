import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Award, Crown, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const Committee = () => {
  const navigate = useNavigate();

  const { data: committeeData, isLoading } = useQuery({
    queryKey: ["electoral-committee-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("electoral_committee_public")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const staffAdviser = committeeData?.find((m) => m.is_staff_adviser);
  const committeeMembers = committeeData?.filter((m) => !m.is_staff_adviser) || [];

  const getPositionIcon = (position: string) => {
    if (position === "Chairman") return <Crown className="h-4 w-4" />;
    if (position.includes("Deputy") || position.includes("Secretary") || position.includes("Treasurer")) return <Award className="h-4 w-4" />;
    return null;
  };

  const getPositionColor = (position: string) => {
    if (position === "Chairman") return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    if (position === "Deputy Chairman") return "bg-blue-500/20 text-blue-600 border-blue-500/30";
    if (position === "Secretary") return "bg-green-500/20 text-green-600 border-green-500/30";
    if (position === "Treasurer") return "bg-purple-500/20 text-purple-600 border-purple-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title="Electoral Committee" 
        description="Meet the ISECO Electoral Committee members responsible for conducting free and fair COHSSA elections at Al-Hikmah University."
        keywords="electoral committee, ISECO, COHSSA elections, Al-Hikmah University, student elections"
      />
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in">
          <DualLogo className="h-10 w-auto" />
          <div className="flex-1" />
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Electoral Committee
          </h1>
          <p className="text-xl text-muted-foreground">2025/2026 Academic Session</p>
        </div>

        {/* Staff Adviser Section */}
        {staffAdviser && (
          <div className="mb-16 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
              <h2 className="text-2xl font-bold px-4">Staff Adviser</h2>
              <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded-full" />
            </div>
            <div className="flex justify-center">
              <Card className="max-w-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardContent className="p-8 relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-44 h-44 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                        <Avatar className="w-full h-full">
                          <AvatarImage 
                            src={staffAdviser.photo_url || undefined}
                            alt={staffAdviser.name || "Staff Adviser"}
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                            {getInitials(staffAdviser.name || "SA")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        {staffAdviser.position}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{staffAdviser.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {staffAdviser.department && <p>{staffAdviser.department}</p>}
                      {staffAdviser.level && <p>{staffAdviser.level}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Committee Members Section */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
            <h2 className="text-2xl font-bold px-4">The Electoral Committee</h2>
            <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded-full" />
          </div>
          
          {committeeMembers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No committee members available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {committeeMembers.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                          <Avatar className="w-full h-full">
                            <AvatarImage 
                              src={member.photo_url || undefined}
                              alt={member.name || "Committee Member"}
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                              {getInitials(member.name || "CM")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{member.name}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPositionColor(member.position || "")}`}>
                        {getPositionIcon(member.position || "")}
                        {member.position}
                      </span>
                      {member.level && <p className="text-sm text-muted-foreground mt-2">{member.level}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Committee;
