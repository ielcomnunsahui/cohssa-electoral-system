import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, CheckCircle, Vote, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const VoterManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [votedFilter, setVotedFilter] = useState<string>("all");

  const { data: voters, isLoading, refetch } = useQuery({
    queryKey: ["admin-voters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_profiles")
        .select("*")
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredVoters = voters?.filter((voter) => {
    const matchesSearch =
      voter.matric.toLowerCase().includes(search.toLowerCase()) ||
      voter.name.toLowerCase().includes(search.toLowerCase()) ||
      voter.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && voter.verified) ||
      (statusFilter === "unverified" && !voter.verified);

    const matchesVoted =
      votedFilter === "all" ||
      (votedFilter === "voted" && voter.voted) ||
      (votedFilter === "not_voted" && !voter.voted);

    return matchesSearch && matchesStatus && matchesVoted;
  });

  const stats = {
    total: voters?.length || 0,
    verified: voters?.filter((v) => v.verified).length || 0,
    voted: voters?.filter((v) => v.voted).length || 0,
    filtered: filteredVoters?.length || 0,
  };

  const handleVerifyVoter = async (voterId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("voter_profiles")
      .update({ verified: !currentStatus })
      .eq("id", voterId);

    if (error) {
      toast.error("Failed to update voter status");
    } else {
      toast.success(`Voter ${!currentStatus ? "verified" : "unverified"} successfully`);
      refetch();
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Voter Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor registered voters
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
              <CardTitle className="text-sm font-medium">
                Total Registered
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.verified}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0
                  ? `${((stats.verified / stats.total) * 100).toFixed(1)}%`
                  : "0%"}{" "}
                of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Voted</CardTitle>
              <Vote className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.voted}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verified > 0
                  ? `${((stats.voted / stats.verified) * 100).toFixed(1)}%`
                  : "0%"}{" "}
                turnout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Filter Result</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.filtered}</div>
              <p className="text-xs text-muted-foreground">
                matching current filters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by matric, name, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select value={votedFilter} onValueChange={setVotedFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Voted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Voters</SelectItem>
                  <SelectItem value="voted">Has Voted</SelectItem>
                  <SelectItem value="not_voted">Not Voted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Voters Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Voted</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading voters...
                      </TableCell>
                    </TableRow>
                  ) : filteredVoters?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No voters found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVoters?.map((voter) => (
                      <TableRow key={voter.id}>
                        <TableCell className="font-mono font-medium">
                          {voter.matric}
                        </TableCell>
                        <TableCell>{voter.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {voter.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={voter.verified ? "default" : "secondary"}
                            className={
                              voter.verified
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {voter.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={voter.voted ? "default" : "outline"}
                            className={
                              voter.voted
                                ? "bg-primary/10 text-primary hover:bg-primary/10"
                                : ""
                            }
                          >
                            {voter.voted ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {voter.registered_at
                            ? format(
                                new Date(voter.registered_at),
                                "MMM d, yyyy HH:mm"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVerifyVoter(voter.id, voter.verified || false)
                            }
                          >
                            {voter.verified ? "Unverify" : "Verify"}
                          </Button>
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

export default VoterManagement;
