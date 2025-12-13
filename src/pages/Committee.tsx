import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Award, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/NavLink";

const Committee = () => {
  const navigate = useNavigate();

  const staffAdviser = {
    name: "Mr. Ismail Lawal",
    position: "Staff Adviser",
    department: "Department of Anatomy",
    faculty: "Faculty of Basic Medical Sciences",
    college: "College of Health Sciences, Al-Hikmah University",
    photo: "/src/assets/staffadviser.jpg"
  };

  const committeeMembers = [
    { name: "Awwal Abubakar Sadik", position: "Chairman", level: "500L Nursing Sciences", photo: "/src/assets/chairman.jpg", order: 1 },
    { name: "Suleiman Uthman Nurraini", position: "Deputy Chairman", level: "400L Medical Laboratory Sciences", photo: "/src/assets/Deputychairman.jpg", order: 2 },
    { name: "Abdullahi Fatimah", position: "Secretary", level: "200L Medicine and Surgery", photo: "/src/assets/secretary.jpg", order: 3 },
    { name: "Mustapha Rahmatullah O.", position: "Treasurer", level: "400L Nursing Sciences", photo: "/src/assets/treasurer.jpg", order: 4 },
    { name: "Yusuf Abdulazeez", position: "Electoral Organizer", level: "400L Human Anatomy", photo: "/src/assets/EO.jpg", order: 5 },
    { name: "Suleiman Siddiqah", position: "P.R.O I", level: "400L Human Physiology", photo: "/src/assets/PROI.jpg", order: 6 },
    { name: "Lawal Awal Pelumi", position: "Member", level: "400L Nursing Sciences", photo: "/src/assets/awal.jpg", order: 7 },
    { name: "Abdulsalam Aaliyah Ayomide", position: "Member", level: "200L Medicine and Surgery", photo: "/src/assets/memberii.jpg", order: 8 },
    { name: "Olaniyi Mariam Ololade", position: "Member", level: "400L Human Anatomy", photo: "/src/assets/memberiii.jpg", order: 9 },
    { name: "Imam Robiah Abdulkadir", position: "Member", level: "300L Medical Laboratory Sciences", photo: "/src/assets/memberiv.jpg", order: 10 }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in">
          <Logo className="h-12 w-12" />
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
                      <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                        <img 
                          src={staffAdviser.photo} 
                          alt={staffAdviser.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/176x176?text=Staff+Adviser";
                          }}
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      {staffAdviser.position}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{staffAdviser.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{staffAdviser.department}</p>
                    <p>{staffAdviser.faculty}</p>
                    <p>{staffAdviser.college}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Committee Members Section */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
            <h2 className="text-2xl font-bold px-4">The Electoral Committee</h2>
            <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {committeeMembers.map((member, index) => (
              <Card 
                key={member.order} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                          <img 
                            src={member.photo} 
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/128x128?text=${member.position}`;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{member.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPositionColor(member.position)} mb-2`}>
                      {getPositionIcon(member.position)}
                      {member.position}
                    </span>
                    <p className="text-sm text-muted-foreground">{member.level}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Committee;