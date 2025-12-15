import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Search, Shield, Clock, Activity, Users, Info } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuditLog {
  id: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details: any;
  created_at: string;
}

const AdminActivityDashboard = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [stats, setStats] = useState({
    totalActions: 0,
    todayActions: 0,
    uniqueEntities: 0,
    lastActivity: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Since audit_logs table doesn't exist, we'll aggregate activity from various tables
      const activities: AuditLog[] = [];

      // Get recent aspirant activity
      const { data: aspirants } = await supabase
        .from('aspirants')
        .select('id, name, status, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      aspirants?.forEach(a => {
        activities.push({
          id: `aspirant-${a.id}`,
          action: a.status === 'pending' ? 'aspirant_submitted' : `aspirant_${a.status}`,
          entity_type: 'aspirants',
          entity_id: a.id,
          details: { name: a.name, status: a.status },
          created_at: a.updated_at || a.created_at || new Date().toISOString()
        });
      });

      // Get recent voter registrations
      const { data: voters } = await supabase
        .from('voters')
        .select('id, name, created_at, verified')
        .order('created_at', { ascending: false })
        .limit(50);

      voters?.forEach(v => {
        activities.push({
          id: `voter-${v.id}`,
          action: v.verified ? 'voter_verified' : 'voter_registered',
          entity_type: 'voters',
          entity_id: v.id,
          details: { name: v.name, verified: v.verified },
          created_at: v.created_at || new Date().toISOString()
        });
      });

      // Get recent candidate promotions
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      candidates?.forEach(c => {
        activities.push({
          id: `candidate-${c.id}`,
          action: 'candidate_promoted',
          entity_type: 'candidates',
          entity_id: c.id,
          details: { name: c.name },
          created_at: c.created_at || new Date().toISOString()
        });
      });

      // Get recent votes
      const { data: votes } = await supabase
        .from('votes')
        .select('id, created_at, position_id')
        .order('created_at', { ascending: false })
        .limit(50);

      votes?.forEach(v => {
        activities.push({
          id: `vote-${v.id}`,
          action: 'vote_cast',
          entity_type: 'votes',
          entity_id: v.id,
          details: { position_id: v.position_id },
          created_at: v.created_at || new Date().toISOString()
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLogs(activities);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLogs = activities.filter(log => 
        new Date(log.created_at) >= today
      );

      const uniqueEntityTypes = new Set(activities.map(log => log.entity_type));

      setStats({
        totalActions: activities.length,
        todayActions: todayLogs.length,
        uniqueEntities: uniqueEntityTypes.size,
        lastActivity: activities[0]?.created_at || ""
      });
    } catch (error: any) {
      console.error("Error loading activity:", error);
      toast.error("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    if (action.includes('disqualified') || action.includes('rejected')) return "destructive";
    if (action.includes('promoted') || action.includes('approved') || action.includes('verified')) return "default";
    if (action.includes('submitted') || action.includes('registered')) return "secondary";
    return "outline";
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.details)?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = actionFilter === "all" || log.action.includes(actionFilter);

    return matchesSearch && matchesFilter;
  });

  const actionTypes = [...new Set(logs.map(log => log.action.split('_')[0]))];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.totalActions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.todayActions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entity Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.uniqueEntities}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-semibold">
                  {stats.lastActivity ? format(new Date(stats.lastActivity), 'PPp') : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Activity log aggregates data from aspirants, voters, candidates, and votes tables. For a dedicated audit log system, please contact support.
          </AlertDescription>
        </Alert>

        {/* Activity Log */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Activity Log
                </CardTitle>
                <CardDescription>Aggregated activity from all system tables</CardDescription>
              </div>
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Log Table */}
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {loading ? "Loading..." : "No activity found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            {format(new Date(log.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.entity_type && (
                            <span className="text-sm">
                              {log.entity_type}
                              {log.entity_id && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({log.entity_id.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details && (
                            <span className="text-sm text-muted-foreground">
                              {log.details.name || JSON.stringify(log.details)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredLogs.length} of {logs.length} entries
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityDashboard;