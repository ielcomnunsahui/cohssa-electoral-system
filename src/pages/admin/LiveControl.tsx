import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pause, Play, Download, FileText, RefreshCw, Trophy, Users, Vote, BarChart3, Loader2, AlertTriangle, Zap, Radio, Wifi, WifiOff, Maximize, Minimize, Grid3X3, Monitor } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAdminTour, liveControlTourSteps } from "@/hooks/useAdminTour";
import SEO from "@/components/SEO";

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

type GridColumns = "auto" | "2" | "3" | "4";

const LiveControl = () => {
  const { startTour } = useAdminTour({
    tourKey: 'live_control',
    steps: liveControlTourSteps,
    autoStart: false,
  });
  const [results, setResults] = useState<PositionResult[]>([]);
  const [prevResults, setPrevResults] = useState<Map<string, number>>(new Map());
  const [animatedCandidates, setAnimatedCandidates] = useState<Set<string>>(new Set());
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingActive, setVotingActive] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastVoteTime, setLastVoteTime] = useState<Date | null>(null);
  const [gridColumns, setGridColumns] = useState<GridColumns>("auto");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { logAction } = useAuditLog();

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        toast.error("Failed to enter fullscreen mode");
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        toast.error("Failed to exit fullscreen mode");
      }
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Get grid template based on selection
  const getGridTemplate = useCallback(() => {
    switch (gridColumns) {
      case "2":
        return "repeat(2, minmax(200px, 1fr))";
      case "3":
        return "repeat(3, minmax(200px, 1fr))";
      case "4":
        return "repeat(4, minmax(200px, 1fr))";
      case "auto":
      default:
        return `repeat(${Math.min(results.length, 4)}, minmax(200px, 1fr))`;
    }
  }, [gridColumns, results.length]);

  const loadResults = useCallback(async () => {
    try {
      const { data: voterData, error: voterError } = await supabase
        .from('voters')
        .select('has_voted, verified');

      if (voterError) throw voterError;

      const verifiedVoters = voterData?.filter(v => v.verified) || [];
      setTotalVoters(verifiedVoters.length);
      setVotedCount(verifiedVoters.filter(v => v.has_voted).length);

      const { data: positions, error: posError } = await supabase
        .from('positions')
        .select('id, title, position_name')
        .eq('is_active', true)
        .order('display_order');

      if (posError) throw posError;

      const { data: candidates, error: candError } = await supabase
        .from('candidates')
        .select('id, name, position_id');

      if (candError) throw candError;

      // Query votes with candidate_id (renamed from aspirant_id)
      const { data: votes, error: voteError } = await supabase
        .from('votes')
        .select('candidate_id, position_id');

      if (voteError) throw voteError;

      const positionResults: PositionResult[] = (positions || []).map(position => {
        const positionCandidates = (candidates || []).filter(c => c.position_id === position.id);
        const positionVotes = (votes || []).filter(v => v.position_id === position.id);
        const totalVotesForPosition = positionVotes.length;

        const candidateResults = positionCandidates.map(candidate => {
          const candidateVotes = positionVotes.filter(v => v.candidate_id === candidate.id).length;
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

      // Check for vote changes and trigger animations
      setPrevResults(prev => {
        const newAnimated = new Set<string>();
        positionResults.forEach(pos => {
          pos.candidates.forEach(cand => {
            const prevVotes = prev.get(cand.id) || 0;
            if (cand.votes > prevVotes && prevVotes > 0) {
              newAnimated.add(cand.id);
              setLastVoteTime(new Date());
            }
          });
        });

        if (newAnimated.size > 0) {
          setAnimatedCandidates(newAnimated);
          setTimeout(() => setAnimatedCandidates(new Set()), 2000);
        }

        // Return new previous results for next comparison
        const newPrevResults = new Map<string, number>();
        positionResults.forEach(pos => {
          pos.candidates.forEach(cand => {
            newPrevResults.set(cand.id, cand.votes);
          });
        });
        return newPrevResults;
      });

      setResults(positionResults);
    } catch (error: any) {
      console.error("Error loading results:", error);
      toast.error(error.message || "Failed to load results");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadTimelineStatus = useCallback(async () => {
    try {
      const { data: stages } = await supabase
        .from('election_timeline')
        .select('*')
        .eq('is_active', true)
        .or('stage_name.ilike.%voting%,title.ilike.%voting%');

      if (stages && stages.length > 0) {
        const now = new Date();
        const activeVoting = stages.find(stage => {
          const start = new Date(stage.start_date);
          const end = stage.end_date ? new Date(stage.end_date) : null;
          return now >= start && (!end || now <= end);
        });
        
        setVotingActive(!!activeVoting);
        setActiveStage(activeVoting?.stage_name || activeVoting?.title || null);
      } else {
        setVotingActive(false);
        setActiveStage(null);
      }
    } catch (error) {
      console.error("Error loading timeline status:", error);
    }
  }, []);

  useEffect(() => {
    loadResults();
    loadTimelineStatus();

    // Set up real-time subscriptions
    const votesChannel = supabase
      .channel('admin-votes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          loadResults();
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const votersChannel = supabase
      .channel('admin-voters-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'voters' },
        () => {
          loadResults();
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    const timelineChannel = supabase
      .channel('admin-timeline-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'election_timeline' },
        () => {
          loadTimelineStatus();
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(votersChannel);
      supabase.removeChannel(timelineChannel);
    };
  }, [loadResults, loadTimelineStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadResults();
    loadTimelineStatus();
  };

  const handleToggleVoting = async () => {
    // Navigate to timeline management to toggle voting stage
    toast.info("Go to Timeline Management to toggle voting stage status");
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
  const totalVotesCast = results.reduce((sum, pos) => sum + pos.total_votes, 0);

  if (loading) {
    return (
      <AdminLayout onStartTour={startTour}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout onStartTour={startTour}>
      <SEO 
        title="Live Election Control" 
        description="Monitor live election progress, view real-time results, and manage voting controls for COHSSA elections."
      />
      <div className={`space-y-6 transition-all duration-300 ${presentationMode ? 'bg-gray-950 -m-6 p-6 min-h-screen' : ''}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${votingActive ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
              <Radio className={`h-6 w-6 ${votingActive ? 'text-green-500 animate-pulse' : 'text-amber-500'} ${presentationMode ? 'h-8 w-8' : ''}`} />
            </div>
            <div>
              <h1 className={`font-bold ${presentationMode ? 'text-4xl text-white' : 'text-3xl'}`}>Live Election Control</h1>
              <p className={`${presentationMode ? 'text-gray-400 text-lg' : 'text-muted-foreground'}`}>Monitor voting progress and manage results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setPresentationMode(!presentationMode)} 
              variant={presentationMode ? "default" : "outline"} 
              size="icon" 
              title={presentationMode ? "Exit Presentation Mode" : "Enter Presentation Mode"}
              className={presentationMode ? "bg-primary" : ""}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="icon" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
              <Wifi className="h-3 w-3" />
              Live Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
              <WifiOff className="h-3 w-3" />
              Connecting...
            </Badge>
          )}
          {updateCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {updateCount} updates
            </Badge>
          )}
        </div>

        {/* Status Banner */}
        <Card 
          className={`border-2 animate-slide-up ${votingActive ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}
          data-tour="election-status"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${votingActive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-semibold text-lg">
                {votingActive ? 'Voting is LIVE' : 'Voting is PAUSED'}
              </span>
            </div>
            <Badge variant={votingActive ? "default" : "secondary"} className="text-sm px-4 py-1">
              {votingActive ? 'Active' : 'Paused'}
            </Badge>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up ${presentationMode ? 'gap-6' : ''}`} style={{ animationDelay: '100ms' }} data-tour="live-stats">
          <Card className={`hover:shadow-md transition-shadow ${presentationMode ? 'bg-gray-900 border-gray-800' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`font-medium flex items-center gap-2 ${presentationMode ? 'text-base text-gray-300' : 'text-sm'}`}>
                <Users className={`text-blue-500 ${presentationMode ? 'h-5 w-5' : 'h-4 w-4'}`} />
                Registered Voters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-bold text-blue-500 ${presentationMode ? 'text-5xl' : 'text-3xl'}`}>{totalVoters}</p>
              <p className={`mt-1 ${presentationMode ? 'text-sm text-gray-500' : 'text-xs text-muted-foreground'}`}>Verified voters</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-md transition-shadow ${presentationMode ? 'bg-gray-900 border-gray-800' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`font-medium flex items-center gap-2 ${presentationMode ? 'text-base text-gray-300' : 'text-sm'}`}>
                <Vote className={`text-green-500 ${presentationMode ? 'h-5 w-5' : 'h-4 w-4'}`} />
                Votes Cast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-bold text-green-500 ${presentationMode ? 'text-5xl' : 'text-3xl'}`}>{votedCount}</p>
              <p className={`mt-1 ${presentationMode ? 'text-sm text-gray-500' : 'text-xs text-muted-foreground'}`}>Voters who voted</p>
            </CardContent>
          </Card>

          <Card className={`hover:shadow-md transition-shadow ${presentationMode ? 'bg-gray-900 border-gray-800' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`font-medium flex items-center gap-2 ${presentationMode ? 'text-base text-gray-300' : 'text-sm'}`}>
                <BarChart3 className={`text-purple-500 ${presentationMode ? 'h-5 w-5' : 'h-4 w-4'}`} />
                Voter Turnout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-bold text-purple-500 ${presentationMode ? 'text-5xl' : 'text-3xl'}`}>{turnoutPercentage.toFixed(1)}%</p>
              <Progress value={turnoutPercentage} className={`mt-2 ${presentationMode ? 'h-3' : 'h-2'}`} />
            </CardContent>
          </Card>

          <Card className={`hover:shadow-md transition-shadow ${presentationMode ? 'bg-gray-900 border-gray-800' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`font-medium flex items-center gap-2 ${presentationMode ? 'text-base text-gray-300' : 'text-sm'}`}>
                <Zap className={`text-amber-500 ${presentationMode ? 'h-5 w-5' : 'h-4 w-4'}`} />
                Total Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-bold text-amber-500 ${presentationMode ? 'text-5xl' : 'text-3xl'}`}>{totalVotesCast}</p>
              <p className={`mt-1 ${presentationMode ? 'text-sm text-gray-500' : 'text-xs text-muted-foreground'}`}>All positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }} data-tour="emergency-controls">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Voting Controls
            </CardTitle>
            <CardDescription>Manage election progress and publish results</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button 
              variant={votingActive ? "destructive" : "default"} 
              className="gap-2" 
              onClick={handleToggleVoting}
            >
              {votingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {votingActive ? 'Pause Voting' : 'Resume Voting'}
            </Button>
            <Button onClick={handlePublishResults} className="gap-2 bg-green-600 hover:bg-green-700">
              <FileText className="h-4 w-4" />
              Publish Final Results
            </Button>
            <Button variant="outline" onClick={handleExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </CardContent>
        </Card>

        {/* Results by Position - Compact Tabular Format for Projection */}
        <div className="space-y-4" ref={containerRef}>
          <div className="flex items-center justify-between">
            <h2 className={`font-semibold animate-fade-in ${presentationMode ? 'text-2xl text-white' : 'text-xl'}`}>Live Results by Position</h2>
            <div className="flex items-center gap-2">
              <Grid3X3 className={`h-4 w-4 ${presentationMode ? 'text-gray-400' : 'text-muted-foreground'}`} />
              <Select value={gridColumns} onValueChange={(v) => setGridColumns(v as GridColumns)}>
                <SelectTrigger className={`w-[120px] h-8 ${presentationMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
                  <SelectValue placeholder="Columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {results.length === 0 ? (
            <Card className={presentationMode ? 'bg-gray-900 border-gray-800' : ''}>
              <CardContent className={`py-12 text-center ${presentationMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
                <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No positions or votes recorded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <div className={`grid ${presentationMode ? 'gap-4' : 'gap-2'}`} style={{ gridTemplateColumns: getGridTemplate() }}>
                {results.map((position, index) => (
                  <Card 
                    key={position.position_id} 
                    className={`animate-slide-up min-w-[200px] ${presentationMode ? 'bg-gray-900 border-gray-800' : ''}`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <CardHeader className={`py-2 px-3 border-b ${presentationMode ? 'bg-gray-800/50 border-gray-700 py-3' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className={`font-semibold truncate ${presentationMode ? 'text-base text-white' : 'text-sm'}`}>{position.position_name}</CardTitle>
                        <Badge variant="secondary" className={`gap-1 shrink-0 ${presentationMode ? 'text-sm bg-gray-700 text-white' : 'text-xs'}`}>
                          <Vote className={presentationMode ? 'h-4 w-4' : 'h-3 w-3'} />
                          {position.total_votes}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {position.candidates.length === 0 ? (
                        <p className={`text-center py-4 ${presentationMode ? 'text-sm text-gray-500' : 'text-xs text-muted-foreground'}`}>No candidates</p>
                      ) : (
                        <div className={`divide-y ${presentationMode ? 'divide-gray-800' : ''}`}>
                          {position.candidates.map((candidate, cidx) => (
                            <div 
                              key={candidate.id}
                              className={`flex items-center gap-2 transition-all duration-500 ${presentationMode ? 'px-4 py-3' : 'px-3 py-2'} ${
                                cidx === 0 && position.total_votes > 0 ? 'bg-amber-500/10' : ''
                              } ${animatedCandidates.has(candidate.id) ? 'animate-pulse bg-green-500/20 ring-2 ring-green-500/50' : ''}`}
                            >
                              <div className={`shrink-0 text-center ${presentationMode ? 'w-6' : 'w-5'}`}>
                                {cidx === 0 && position.total_votes > 0 ? (
                                  <Trophy className={`text-amber-500 ${presentationMode ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                ) : (
                                  <span className={`${presentationMode ? 'text-sm text-gray-500' : 'text-xs text-muted-foreground'}`}>{cidx + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${presentationMode ? 'text-base text-white' : 'text-sm'} ${animatedCandidates.has(candidate.id) ? 'text-green-500 font-bold' : ''}`}>
                                  {candidate.name}
                                </p>
                                <Progress 
                                  value={candidate.percentage} 
                                  className={`mt-1 transition-all duration-500 ${presentationMode ? 'h-2' : 'h-1.5'} ${animatedCandidates.has(candidate.id) ? (presentationMode ? 'h-3' : 'h-2') : ''}`}
                                />
                              </div>
                              <div className="shrink-0 text-right">
                                <Badge 
                                  variant={cidx === 0 && position.total_votes > 0 ? "default" : "outline"} 
                                  className={`transition-all duration-300 ${presentationMode ? 'text-sm' : 'text-xs'} ${animatedCandidates.has(candidate.id) ? 'scale-110 bg-green-500 text-white' : ''}`}
                                >
                                  {candidate.votes}
                                </Badge>
                                <p className={`mt-0.5 ${presentationMode ? 'text-sm text-gray-400' : 'text-xs text-muted-foreground'}`}>
                                  {candidate.percentage.toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default LiveControl;
