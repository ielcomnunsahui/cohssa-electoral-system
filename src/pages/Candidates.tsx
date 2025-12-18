import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2, WifiOff, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DualLogo } from "@/components/NavLink";
import SEO from "@/components/SEO";

interface Candidate {
  id: string;
  name: string;
  photo_url: string;
  matric: string;
  department: string;
  manifesto: string | null;
  voting_positions: {
    position_name: string;
    display_order: number;
  } | null;
}

const Candidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          id,
          name,
          photo_url,
          matric,
          department,
          manifesto,
          position_id,
          positions (
            title,
            display_order
          )
        `);

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load candidates. Please check your connection.");
        toast.error("Failed to load candidates");
        return;
      }
      
      // Transform data to expected format
      const validCandidates = (data || []).filter(c => c.positions !== null).map(c => ({
        ...c,
        voting_positions: c.positions ? { position_name: c.positions.title, display_order: c.positions.display_order } : null
      })) as Candidate[];
      setCandidates(validCandidates);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please check your internet connection.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Group candidates by position
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    if (!candidate.voting_positions) return acc;
    const position = candidate.voting_positions.position_name;
    if (!acc[position]) {
      acc[position] = {
        candidates: [],
        displayOrder: candidate.voting_positions.display_order
      };
    }
    acc[position].candidates.push(candidate);
    return acc;
  }, {} as Record<string, { candidates: Candidate[]; displayOrder: number }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <SEO 
        title="Meet the Candidates" 
        description="View all candidates running for COHSSA student union positions. Read their manifestos and learn about their vision for the association."
        keywords="COHSSA candidates, student election candidates, ISECO, Al-Hikmah University elections, student union"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 animate-fade-in">
          <DualLogo logoSize="h-10 w-10" />
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
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Meet the Candidates
          </h1>
          <p className="text-xl text-muted-foreground">AHSS Student Union Election 2025/2026</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        ) : error ? (
          <Card className="max-w-2xl mx-auto animate-fade-in">
            <CardContent className="p-12 text-center">
              <WifiOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchCandidates} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : candidates.length === 0 ? (
          <Card className="max-w-2xl mx-auto animate-fade-in">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No Candidates Yet</p>
              <p className="text-muted-foreground">
                Candidates will be announced soon. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {Object.entries(groupedCandidates)
              .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
              .map(([position, { candidates: positionCandidates }], groupIndex) => (
                <div 
                  key={position} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-1 flex-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                    <h2 className="text-2xl font-bold px-4">{position}</h2>
                    <div className="h-1 flex-1 bg-gradient-to-l from-primary/50 to-transparent rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {positionCandidates.map((candidate, index) => (
                      <Card 
                        key={candidate.id} 
                        className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4">
                              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                                  <img 
                                    src={candidate.photo_url} 
                                    alt={candidate.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.src = "https://via.placeholder.com/128x128?text=Candidate";
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-medium">
                                {candidate.matric}
                              </div>
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                              {candidate.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">{candidate.department}</p>
                            {candidate.manifesto && (
                              <div className="text-sm text-left bg-muted/50 p-3 rounded-lg w-full">
                                <p className="line-clamp-4">{candidate.manifesto}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;