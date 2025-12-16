import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pause, Play, Download, FileText } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";

interface VoteResult {
  position_name: string;
  candidate_name: string;
  votes: number;
  total_votes: number;
}

const LiveControl = () => {
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [votedCount, setVotedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();

  useEffect(() => {
    loadResults();
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadResults = async () => {
    try {
      const { data: voterData, error: voterError } = await supabase
        .from('voters')
        .select('has_voted, verified');

      if (voterError) throw voterError;

      const verifiedVoters = voterData?.filter(v => v.verified) || [];
      setTotalVoters(verifiedVoters.length);
      setVotedCount(verifiedVoters.filter(v => v.has_voted).length);

      // Load vote results
      const { data: votes } = await supabase
        .from('votes')
        .select(`
          aspirant_id,
          position_id,
          aspirants(name),
          positions(title)
        `);

      if (votes && votes.length > 0) {
        // Group votes by position and candidate
        const grouped = votes.reduce((acc: any, vote: any) => {
          const positionName = vote.positions?.title || 'Unknown';
          const candidateName = vote.aspirants?.name || 'Unknown';
          const key = `${positionName}-${candidateName}`;
          
          if (!acc[key]) {
            acc[key] = {
              position_name: positionName,
              candidate_name: candidateName,
              votes: 0,
              total_votes: 0
            };
          }
          acc[key].votes++;
          return acc;
        }, {});

        setResults(Object.values(grouped));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    if (!confirm("Are you sure you want to publish final results? This action cannot be undone.")) return;

    await logAction({
      action: 'results_publish',
      entity_type: 'election_results'
    });

    toast.success("Final results published");
  };

  const turnoutPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Total Registered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{totalVoters}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Votes Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{votedCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voter Turnout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{turnoutPercentage.toFixed(1)}%</p>
              <Progress value={turnoutPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Live Voting Control</CardTitle>
            <CardDescription>Manage election progress and results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Freeze Results
              </Button>
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Resume Voting
              </Button>
              <Button onClick={handlePublishResults}>
                <FileText className="mr-2 h-4 w-4" />
                Publish Final Results
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Position Results</h3>
              {results.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No votes recorded yet. Results will appear here once voting starts.
                </p>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{result.candidate_name}</span>
                        <Badge>{result.votes} votes</Badge>
                      </div>
                      <Progress 
                        value={result.total_votes > 0 ? (result.votes / result.total_votes) * 100 : 0} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default LiveControl;