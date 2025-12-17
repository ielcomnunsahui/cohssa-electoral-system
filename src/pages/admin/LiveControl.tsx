import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pause, Play, Download, FileText, RefreshCw, Trophy, Users, Vote, BarChart3, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PositionResult {
  position_id: string;
  position_name: string;
  candidates: {
    id: string;
    name: string;
    votes: number;
    percentage: number;
  }[];
  total_votes: number;
}

const LiveControl = () => {
  const [results, setResults] = useState<PositionResult[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingActive, setVotingActive] = useState(true);
  const { logAction } = useAuditLog();

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadResults = async () => {
    try {
      // Get voter stats
      const { data: voterData, error: voterError } = await supabase
        .from('voters')
        .select('has_voted, verified');

      if (voterError) throw voterError;

      const verifiedVoters = voterData?.filter(v => v.verified) || [];
      setTotalVoters(verifiedVoters.length);
      setVotedCount(verifiedVoters.filter(v => v.has_voted).length);

      // Get all positions
      const { data: positions, error: posError } = await supabase
        .from('positions')
        .select('id, title, position_name')
        .eq('is_active', true)
        .order('display_order');

      if (posError) throw posError;

      // Get all candidates
      const { data: candidates, error: candError } = await supabase
        .from('candidates')
        .select('id, name, position_id');

      if (candError) throw candError;

      // Get all votes
      const { data: votes, error: voteError } = await supabase
        .from('votes')
        .select('aspirant_id, position_id');

      if (voteError) throw voteError;

      // Process results by position
      const positionResults: PositionResult[] = (positions || []).map(position => {
        const positionCandidates = (candidates || []).filter(c => c.position_id === position.id);
        const positionVotes = (votes || []).filter(v => v.position_id === position.id);
        const totalVotesForPosition = positionVotes.length;

        const candidateResults = positionCandidates.map(candidate => {
          const candidateVotes = positionVotes.filter(v => v.aspirant_id === candidate.id).length;
          return {
            id: candidate.id,
            name: candidate.name,
            votes: candidateVotes,
            percentage: totalVotesForPosition > 0 ? (candidateVotes / totalVotesForPosition) * 100 : 0
          };
        }).sort((a, b) => b.votes - a.votes);

        return {
          position_id: position.id,
          position_name: position.position_name || position.title,
          candidates: candidateResults,
          total_votes: totalVotesForPosition
        };
      });

      setResults(positionResults);
    } catch (error: any) {
      console.error("Error loading results:", error);
      toast.error(error.message || "Failed to load results");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadResults();
  };

  const handlePublishResults = async () => {
    if (!confirm("Are you sure you want to publish final results? This action cannot be undone.")) return;

    await logAction({
      action: 'results_publish',
      entity_type: 'election_results'
    });

    toast.success("Final results published");
  };

  const handleExportReport = () => {
    const reportData = results.map(pos => ({
      position: pos.position_name,
      total_votes: pos.total_votes,
      candidates: pos.candidates.map(c => `${c.name}: ${c.votes} (${c.percentage.toFixed(1)}%)`).join(', ')
    }));

    const csv = [
      ['Position', 'Total Votes', 'Candidates'],
      ...reportData.map(r => [r.position, r.total_votes, r.candidates])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Report exported");
  };

  const turnoutPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Election Control</h1>
            <p className="text-muted-foreground">Monitor voting progress and manage results</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Registered Voters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalVoters}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Vote className="h-4 w-4 text-green-500" />
                Votes Cast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{votedCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Voter Turnout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{turnoutPercentage.toFixed(1)}%</p>
              <Progress value={turnoutPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{results.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Voting Controls</CardTitle>
            <CardDescription>Manage election progress and publish results</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button variant={votingActive ? "destructive" : "default"} className="gap-2" onClick={() => setVotingActive(!votingActive)}>
              {votingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {votingActive ? 'Pause Voting' : 'Resume Voting'}
            </Button>
            <Button onClick={handlePublishResults} className="gap-2">
              <FileText className="h-4 w-4" />
              Publish Final Results
            </Button>
            <Button variant="outline" onClick={handleExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </CardContent>
        </Card>

        {/* Results by Position */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Live Results by Position</h2>
          
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No positions or votes recorded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((position, index) => (
                <Card key={position.position_id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{position.position_name}</CardTitle>
                      <Badge variant="secondary">{position.total_votes} votes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {position.candidates.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No candidates for this position</p>
                    ) : (
                      <div className="space-y-4">
                        {position.candidates.map((candidate, cidx) => (
                          <div key={candidate.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {cidx === 0 && position.total_votes > 0 && (
                                  <Trophy className="h-4 w-4 text-amber-500" />
                                )}
                                <span className="font-medium">{candidate.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={cidx === 0 ? "default" : "outline"}>
                                  {candidate.votes} votes
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  ({candidate.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <Progress 
                              value={candidate.percentage} 
                              className={cidx === 0 && position.total_votes > 0 ? "h-3" : "h-2"}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LiveControl;
