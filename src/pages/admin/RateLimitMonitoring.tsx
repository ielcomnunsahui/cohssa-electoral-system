import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, RefreshCw, ShieldAlert, Clock, Ban, Activity, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface RateLimitEntry {
  id: string;
  identifier: string;
  action_type: string;
  attempt_count: number;
  first_attempt_at: string | null;
  last_attempt_at: string | null;
  locked_until: string | null;
  created_at: string | null;
}

const RateLimitMonitoring = () => {
  const [search, setSearch] = useState("");

  const { data: rateLimits, isLoading, refetch } = useQuery({
    queryKey: ["admin-rate-limits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limits")
        .select("*")
        .order("last_attempt_at", { ascending: false });

      if (error) throw error;
      return (data as RateLimitEntry[]) || [];
    },
  });

  const now = new Date();
  const lockedEntries = rateLimits?.filter(r => r.locked_until && new Date(r.locked_until) > now) || [];
  const highAttemptEntries = rateLimits?.filter(r => (r.attempt_count || 0) >= 3) || [];
  const recentEntries = rateLimits?.filter(r => {
    if (!r.last_attempt_at) return false;
    const lastAttempt = new Date(r.last_attempt_at);
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return lastAttempt > hourAgo;
  }) || [];

  const filteredLimits = rateLimits?.filter((entry) => {
    const matchesSearch =
      entry.identifier?.toLowerCase().includes(search.toLowerCase()) ||
      entry.action_type?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  }) || [];

  const getStatusBadge = (entry: RateLimitEntry) => {
    if (entry.locked_until && new Date(entry.locked_until) > now) {
      return <Badge variant="destructive">Locked</Badge>;
    }
    if (entry.attempt_count >= 4) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">High Attempts</Badge>;
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  const getActionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      matric_lookup: "bg-blue-100 text-blue-800",
      login: "bg-purple-100 text-purple-800",
      otp_request: "bg-green-100 text-green-800",
    };
    return (
      <Badge variant="secondary" className={colors[type] || "bg-gray-100 text-gray-800"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rate Limit Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor blocked users and abuse patterns
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rateLimits?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currently Locked</CardTitle>
              <Ban className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lockedEntries.length}</div>
              <p className="text-xs text-muted-foreground">Active lockouts</p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Attempts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{highAttemptEntries.length}</div>
              <p className="text-xs text-muted-foreground">3+ failed attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentEntries.length}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
        </div>

        {/* Currently Locked Alert */}
        {lockedEntries.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">Active Lockouts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lockedEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                    <div>
                      <span className="font-mono text-sm">{entry.identifier}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      {getActionTypeBadge(entry.action_type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unlocks {formatDistanceToNow(new Date(entry.locked_until!), { addSuffix: true })}
                    </div>
                  </div>
                ))}
                {lockedEntries.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{lockedEntries.length - 5} more locked entries
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by identifier or action type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Rate Limit Entries</CardTitle>
            <CardDescription>
              Track rate limiting across all actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>First Attempt</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Locked Until</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading rate limits...
                      </TableCell>
                    </TableRow>
                  ) : filteredLimits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {search ? "No entries matching search" : "No rate limit entries yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLimits.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">
                          {entry.identifier.length > 30 
                            ? `${entry.identifier.substring(0, 15)}...${entry.identifier.substring(entry.identifier.length - 10)}`
                            : entry.identifier}
                        </TableCell>
                        <TableCell>{getActionTypeBadge(entry.action_type)}</TableCell>
                        <TableCell>
                          <span className={entry.attempt_count >= 4 ? "text-destructive font-bold" : ""}>
                            {entry.attempt_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.first_attempt_at
                            ? format(new Date(entry.first_attempt_at), "MMM d, HH:mm")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.last_attempt_at
                            ? formatDistanceToNow(new Date(entry.last_attempt_at), { addSuffix: true })
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(entry)}</TableCell>
                        <TableCell className="text-sm">
                          {entry.locked_until && new Date(entry.locked_until) > now
                            ? format(new Date(entry.locked_until), "MMM d, HH:mm")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RateLimitMonitoring;
