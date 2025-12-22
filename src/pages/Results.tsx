import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Users, BarChart3, Loader2, RefreshCw, Radio, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { SEO } from "@/components/SEO";
import ThemeToggle from "@/components/ThemeToggle";

interface PositionResult {
  position_id: string;
  position_name: string;
  candidates: {
    id: string;
    name: string;
    photo_url: string;
    department: string;
    votes: number;
    percentage: number;
  }[];
  total_votes: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PositionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResultsStageActive, setIsResultsStageActive] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [liveUpdateCount, setLiveUpdateCount] = useState(0);

  const loadResultsCallback = useCallback(async () => {
    try {
      const { data: voterData } = await supabase
        .from('voters')
        .select('has_voted, verified');

      const verified = voterData?.filter(v => v.verified) || [];
      setTotalVoters(verified.length);
      setVotedCount(verified.filter(v => v.has_voted).length);

      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      const { data: candidates } = await supabase
        .from('candidates')
        .select('*, position_id');

      const { data: votes } = await supabase
        .from('votes')
        .select('aspirant_id, position_id');

      const positionResults: PositionResult[] = (positions || []).map(position => {
        const positionCandidates = (candidates || []).filter(c => c.position_id === position.id);
        const positionVotes = (votes || []).filter(v => v.position_id === position.id);
        const totalVotes = positionVotes.length;

        const candidatesWithVotes = positionCandidates.map(candidate => {
          const candidateVotes = positionVotes.filter(v => v.aspirant_id === candidate.id).length;
          return {
            id: candidate.id,
            name: candidate.name,
            photo_url: candidate.photo_url,
            department: candidate.department,
            votes: candidateVotes,
            percentage: totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0
          };
        }).sort((a, b) => b.votes - a.votes);

        return {
          position_id: position.id,
          position_name: position.position_name || position.title,
          candidates: candidatesWithVotes,
          total_votes: totalVotes
        };
      });

      setResults(positionResults);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkResultsStage();
    loadResultsCallback();

    // Set up real-time subscription for votes
    const votesChannel = supabase
      .channel('realtime-votes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'votes' }, 
        (payload) => {
          console.log('New vote received:', payload);
          setLiveUpdateCount(prev => prev + 1);
          loadResultsCallback();
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'votes' }, 
        () => {
          loadResultsCallback();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Realtime subscription status:', status);
      });

    // Set up real-time subscription for voters (to track has_voted changes)
    const votersChannel = supabase
      .channel('realtime-voters')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'voters' }, 
        (payload) => {
          if (payload.new && (payload.new as any).has_voted !== (payload.old as any)?.has_voted) {
            loadResultsCallback();
          }
        }
      )
      .subscribe();

    // Also subscribe to timeline changes to update results stage status
    const timelineChannel = supabase
      .channel('realtime-timeline')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'election_timeline' }, 
        () => {
          checkResultsStage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(votersChannel);
      supabase.removeChannel(timelineChannel);
    };
  }, [loadResultsCallback]);

  const checkResultsStage = async () => {
    try {
      const { data: timeline } = await supabase
        .from('election_timeline')
        .select('*')
        .ilike('stage_name', '%results%')
        .maybeSingle();

      if (timeline) {
        const now = new Date();
        const start = new Date(timeline.start_time);
        const end = new Date(timeline.end_time);
        setIsResultsStageActive(timeline.is_active && now >= start && now <= end);
      }
    } catch (error) {
      console.error("Error checking results stage:", error);
    }
  };

  const loadResults = () => {
    loadResultsCallback();
  };

  const turnoutPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

  if (!isResultsStageActive && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <SEO 
          title="Election Results" 
          description="View live COHSSA election results at Al-Hikmah University. Real-time vote counts and winner announcements."
          keywords="election results, COHSSA, vote count, winners, Al-Hikmah University"
        />
        <div className="container mx-auto max-w-2xl py-16">
          <Card className="text-center p-8">
            <CardContent className="space-y-4">
              <DualLogo className="h-16 w-auto mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Results Not Yet Available</h1>
              <p className="text-muted-foreground">
                Election results will be displayed here once the results stage is activated by the electoral committee.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <SEO 
        title="Election Results" 
        description="View live COHSSA election results at Al-Hikmah University. Real-time vote counts and winner announcements."
        keywords="election results, COHSSA, vote count, winners, Al-Hikmah University"
      />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <DualLogo className="h-8 w-auto" />
            <div className="flex items-center gap-2">
              <span className="font-bold">Live Results</span>
              {isConnected && (
                <Badge variant="outline" className="gap-1 text-xs animate-pulse bg-green-500/10 border-green-500/50 text-green-600">
                  <Wifi className="h-3 w-3" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={loadResults} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Registered Voters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVoters}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Votes Cast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{votedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Voter Turnout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{turnoutPercentage.toFixed(1)}%</p>
              <Progress value={turnoutPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="gap-1">
              <Radio className="h-3 w-3 animate-pulse text-green-500" />
              Real-time updates active
            </Badge>
          )}
          {liveUpdateCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {liveUpdateCount} live update{liveUpdateCount > 1 ? 's' : ''} received
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No results to display yet.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {results.map((position, index) => {
              const winner = position.candidates[0];
              const chartData = position.candidates.map(c => ({ name: c.name, votes: c.votes }));

              return (
                <Card key={position.position_id} className="animate-fade-in overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center justify-between">
                      <span>{position.position_name}</span>
                      <Badge variant="secondary">{position.total_votes} total votes</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Winner Highlight */}
                    {winner && winner.votes > 0 && (
                      <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div className="flex-1">
                          <p className="font-semibold">{winner.name}</p>
                          <p className="text-sm text-muted-foreground">{winner.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{winner.votes}</p>
                          <p className="text-sm text-muted-foreground">{winner.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Bar Chart */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} layout="vertical">
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      {position.total_votes > 0 && (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                dataKey="votes"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                labelLine={false}
                              >
                                {chartData.map((_, i) => (
                                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Candidate List */}
                    <div className="space-y-3">
                      {position.candidates.map((candidate, i) => (
                        <div key={candidate.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <img
                            src={candidate.photo_url}
                            alt={candidate.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{candidate.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{candidate.votes}</p>
                            <Progress value={candidate.percentage} className="w-20 h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
