import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Vote, LogOut, ArrowLeft, ClipboardList, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voterProfile, setVoterProfile] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<{[key: string]: string}>({});
  const [votingStarted, setVotingStarted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVoterData();
  }, []);

  const loadVoterData = async () => {
    try {
      // First try Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fallback to session storage for biometric login
      const sessionData = sessionStorage.getItem('voter_session');
      const voterSession = sessionData ? JSON.parse(sessionData) : null;
      
      if (!user && !voterSession?.authenticated) {
        navigate("/voter/login");
        return;
      }

      // Check session validity (max 1 hour)
      if (voterSession && !user) {
        const sessionAge = Date.now() - (voterSession.timestamp || 0);
        if (sessionAge > 60 * 60 * 1000) {
          sessionStorage.removeItem('voter_session');
          toast.error("Session expired. Please login again.");
          navigate("/voter/login");
          return;
        }
      }

      let profile;
      
      if (user) {
        // Load from Supabase auth user
        const { data, error: profileError } = await supabase
          .from('voters')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;
        profile = data;
      } else if (voterSession?.matric) {
        // Load from session storage (biometric login)
        const { data, error: profileError } = await supabase
          .from('voters')
          .select('*')
          .ilike('matric_number', voterSession.matric)
          .single();

        if (profileError) throw profileError;
        profile = data;
      }
      
      if (!profile) {
        toast.error("Voter profile not found");
        navigate("/voter/login");
        return;
      }
      
      if (!profile.verified) {
        toast.error("Your account is not verified yet");
        navigate("/voter/login");
        return;
      }

      if (profile.has_voted) {
        toast.info("You have already voted");
      }

      setVoterProfile(profile);

      const { data: positionsData, error: positionsError } = await supabase
        .from('positions')
        .select(`
          *,
          candidates (
            id,
            name,
            photo_url,
            department,
            manifesto
          )
        `)
        .eq('is_active', true)
        .order('display_order');

      if (positionsError) throw positionsError;
      setPositions(positionsData || []);
    } catch (error: any) {
      console.error("Error loading voter data:", error);
      toast.error(error.message || "Failed to load voter data");
      navigate("/voter/login");
    } finally {
      setLoading(false);
    }
  };

  const handleStartVoting = () => {
    if (voterProfile?.has_voted) {
      toast.error("You have already cast your vote");
      return;
    }
    setVotingStarted(true);
  };

  const handleSelectCandidate = (candidateId: string) => {
    const position = positions[currentPositionIndex];
    setSelectedCandidates(prev => ({
      ...prev,
      [position.id]: candidateId
    }));
  };

  const handleNext = () => {
    // Allow proceeding without selecting a candidate for a position
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

  const handleSubmitVote = async () => {
    if (!voterProfile?.id) {
      toast.error("Invalid voter session");
      return;
    }

    setSubmitting(true);
    try {
      const votes = Object.entries(selectedCandidates).map(([positionId, candidateId]) => ({
        position_id: positionId,
        aspirant_id: candidateId,
        voter_id: voterProfile.id
      }));

      const { error: voteError } = await supabase
        .from('votes')
        .insert(votes);

      if (voteError) throw voteError;

      const { error: profileError } = await supabase
        .from('voters')
        .update({ 
          has_voted: true
        })
        .eq('id', voterProfile.id);

      if (profileError) throw profileError;

      toast.success("Your vote has been recorded successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting vote:", error);
      toast.error(error.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('voter_session');
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto"></div>
          <p className="mt-4 text-medical-700">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPosition = positions[currentPositionIndex];
  const isLastPosition = currentPositionIndex === positions.length - 1;
  const hasAtLeastOneSelection = Object.keys(selectedCandidates).length > 0;

  // Helper to get candidate name by ID
  const getCandidateName = (positionId: string, candidateId: string) => {
    const position = positions.find(p => p.id === positionId);
    const candidate = position?.candidates?.find((c: any) => c.id === candidateId);
    return candidate?.name || "Unknown";
  };

  const getCandidatePhoto = (positionId: string, candidateId: string) => {
    const position = positions.find(p => p.id === positionId);
    const candidate = position?.candidates?.find((c: any) => c.id === candidateId);
    return candidate?.photo_url || "/placeholder.svg";
  };

  const handleProceedToReview = () => {
    setShowReview(true);
  };

  const handleBackToVoting = () => {
    setShowReview(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-sm">{voterProfile?.name}</p>
              <p className="text-xs text-muted-foreground">{voterProfile?.matric_number}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!votingStarted ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-6 w-6 text-medical-600" />
                Voter Dashboard
              </CardTitle>
              <CardDescription>Welcome to the AHSS ISECO Election</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{voterProfile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matric Number</p>
                  <p className="font-semibold">{voterProfile?.matric_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <Badge variant={voterProfile?.verified ? "default" : "secondary"}>
                    {voterProfile?.verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voting Status</p>
                  <Badge variant={voterProfile?.has_voted ? "secondary" : "default"}>
                    {voterProfile?.has_voted ? "Already Voted" : "Not Voted"}
                  </Badge>
                </div>
              </div>

              {voterProfile?.has_voted ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have already cast your vote. Thank you for participating in the election!
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You will vote for {positions.length} positions. Once you start, you must complete all selections before submitting.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleStartVoting} size="lg" className="w-full">
                    <Vote className="mr-2 h-5 w-5" />
                    Start Voting
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : showReview ? (
          // Review Summary Screen
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-medical-600" />
                <div>
                  <CardTitle>Review Your Votes</CardTitle>
                  <CardDescription>Please confirm your selections before submitting</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-amber-500/30 bg-amber-500/5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  Once submitted, your vote cannot be changed. Please review carefully.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {positions.map((position) => {
                  const selectedCandidateId = selectedCandidates[position.id];
                  const hasSelection = !!selectedCandidateId;

                  return (
                    <div 
                      key={position.id} 
                      className={`p-4 rounded-lg border ${hasSelection ? 'bg-green-50 border-green-200' : 'bg-muted/50 border-muted'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground font-medium">
                            {position.position_name || position.title}
                          </p>
                          {hasSelection ? (
                            <div className="flex items-center gap-3 mt-2">
                              <img
                                src={getCandidatePhoto(position.id, selectedCandidateId)}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <p className="font-semibold text-green-700">
                                {getCandidateName(position.id, selectedCandidateId)}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2">
                              <MinusCircle className="h-5 w-5 text-muted-foreground" />
                              <p className="text-muted-foreground italic">Abstained</p>
                            </div>
                          )}
                        </div>
                        {hasSelection ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Badge variant="secondary">Skipped</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  You voted for <span className="font-semibold text-foreground">{Object.keys(selectedCandidates).length}</span> out of <span className="font-semibold text-foreground">{positions.length}</span> positions
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToVoting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back & Edit
                </Button>

                <Button
                  onClick={handleSubmitVote}
                  disabled={!hasAtLeastOneSelection || submitting}
                  className="bg-success hover:bg-success/90 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Confirm & Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Voting Screen
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{currentPosition?.position_name || currentPosition?.title}</CardTitle>
                  <CardDescription>
                    Position {currentPositionIndex + 1} of {positions.length}
                  </CardDescription>
                </div>
                <Badge>
                  {Object.keys(selectedCandidates).length} / {positions.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPosition?.candidates?.map((candidate: any) => (
                  <Card 
                    key={candidate.id}
                    className={`cursor-pointer transition-all ${
                      selectedCandidates[currentPosition.id] === candidate.id
                        ? 'ring-2 ring-medical-600 border-medical-600'
                        : 'hover:border-medical-300'
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={candidate.photo_url || '/placeholder.svg'}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.department}</p>
                          {candidate.manifesto && (
                            <p className="text-xs mt-2 line-clamp-3">{candidate.manifesto}</p>
                          )}
                        </div>
                        {selectedCandidates[currentPosition.id] === candidate.id && (
                          <CheckCircle className="h-6 w-6 text-medical-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!selectedCandidates[currentPosition?.id] && (
                <p className="text-center text-sm text-muted-foreground italic">
                  You can skip this position if you don't want to vote for any candidate
                </p>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentPositionIndex === 0}
                >
                  Previous
                </Button>

                {isLastPosition ? (
                  <Button
                    onClick={handleProceedToReview}
                    disabled={!hasAtLeastOneSelection}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Review Votes
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default VoterDashboard;