import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Filter, FileText, UserCheck, UserX, Clock, Loader2, Users, TrendingUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTour, aspirantReviewTourSteps } from "@/hooks/useAdminTour";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AspirantReview = () => {
  const navigate = useNavigate();
  const { startTour } = useAdminTour({
    tourKey: 'aspirant_review',
    steps: aspirantReviewTourSteps,
    autoStart: false,
  });
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const loadApplications = async () => {
    try {
      // First get aspirants
      const { data: aspirantsData, error: aspirantsError } = await supabase
        .from('aspirants')
        .select('*')
        .order('created_at', { ascending: false });

      if (aspirantsError) {
        console.error("Aspirants fetch error:", aspirantsError);
        throw aspirantsError;
      }

      // Then get positions separately
      const { data: positionsData } = await supabase
        .from('positions')
        .select('id, title, fee');

      // Map positions to aspirants
      const positionsMap = new Map((positionsData || []).map(p => [p.id, p]));
      const enrichedData = (aspirantsData || []).map(aspirant => ({
        ...aspirant,
        positions: aspirant.position_id ? positionsMap.get(aspirant.position_id) : null
      }));

      setApplications(enrichedData);
    } catch (error: any) {
      console.error("Load applications error:", error);
      toast.error("Failed to load applications: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    toast.success("Applications refreshed");
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.full_name?.toLowerCase().includes(query) ||
        app.name?.toLowerCase().includes(query) ||
        app.matric_number?.toLowerCase().includes(query) ||
        app.positions?.title?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; bgColor: string; textColor: string }> = {
      pending: { variant: "outline", icon: Clock, bgColor: "bg-amber-500/10", textColor: "text-amber-600" },
      submitted: { variant: "secondary", icon: FileText, bgColor: "bg-blue-500/10", textColor: "text-blue-600" },
      under_review: { variant: "default", icon: Eye, bgColor: "bg-purple-500/10", textColor: "text-purple-600" },
      approved: { variant: "default", icon: UserCheck, bgColor: "bg-green-500/10", textColor: "text-green-600" },
      rejected: { variant: "destructive", icon: UserX, bgColor: "bg-red-500/10", textColor: "text-red-600" },
      payment_verified: { variant: "default", icon: UserCheck, bgColor: "bg-emerald-500/10", textColor: "text-emerald-600" },
      screening_scheduled: { variant: "default", icon: Clock, bgColor: "bg-indigo-500/10", textColor: "text-indigo-600" },
    };
    const { icon: Icon, bgColor, textColor } = config[status] || config.pending;
    return (
      <Badge className={`gap-1.5 ${bgColor} ${textColor} border-0 font-medium`}>
        <Icon className="h-3 w-3" />
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const statsData = [
    { label: "Pending", value: statusCounts.pending, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10", icon: Clock, filterValue: "pending" },
    { label: "Submitted", value: statusCounts.submitted, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", icon: FileText, filterValue: "submitted" },
    { label: "Under Review", value: statusCounts.under_review, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", icon: Eye, filterValue: "under_review" },
    { label: "Approved", value: statusCounts.approved, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", icon: UserCheck, filterValue: "approved" },
    { label: "Rejected", value: statusCounts.rejected, color: "from-red-500 to-rose-500", bgColor: "bg-red-500/10", icon: UserX, filterValue: "rejected" },
  ];

  return (
    <AdminLayout onStartTour={startTour}>
      <SEO 
        title="Aspirant Review" 
        description="Review and manage aspirant applications for COHSSA elections. Verify payments, screen candidates, and approve applications."
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Aspirant Applications
            </h1>
            <p className="text-muted-foreground mt-1">Review and manage candidate applications</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">{applications.length}</span>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-tour="aspirant-stats">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label} 
                className={`cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden animate-fade-in ${statusFilter === stat.filterValue ? 'ring-2 ring-primary' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setStatusFilter(stat.filterValue)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-4 relative">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="animate-fade-in border-0 shadow-sm" style={{ animationDelay: '150ms' }} data-tour="aspirant-filters">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, matric, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-2"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-56 bg-muted/50 border-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                  <SelectItem value="submitted">Submitted ({statusCounts.submitted})</SelectItem>
                  <SelectItem value="under_review">Under Review ({statusCounts.under_review})</SelectItem>
                  <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                  <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter !== "all" && (
                <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")} className="text-muted-foreground">
                  Clear filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="animate-fade-in border-0 shadow-sm overflow-hidden" style={{ animationDelay: '200ms' }} data-tour="aspirant-list">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Applications ({filteredApplications.length})
                </CardTitle>
                <CardDescription>Click on any row to review full application details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No applications found</h3>
                <p className="text-muted-foreground">
                  {applications.length === 0 ? "No applications have been submitted yet" : "No applications match your current filters"}
                </p>
                {statusFilter !== "all" && (
                  <Button variant="link" onClick={() => setStatusFilter("all")} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Matric No.</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead data-tour="aspirant-actions" className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app, index) => (
                      <TableRow 
                        key={app.id} 
                        className="hover:bg-muted/30 transition-all cursor-pointer group animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => navigate(`/admin/aspirants/${app.id}`)}
                      >
                        <TableCell>
                          <Avatar className="h-10 w-10 border-2 border-muted group-hover:border-primary/50 transition-colors">
                            <AvatarImage src={app.photo_url || (app.step_data as any)?.personal?.photo_url} alt={app.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {(app.full_name || app.name || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{app.full_name || app.name}</p>
                            <p className="text-xs text-muted-foreground">{app.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{app.matric_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {app.positions?.title || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{app.cgpa?.toFixed(2) || '-'}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.payment_proof_url ? (
                            <Badge className="bg-green-500/10 text-green-600 border-0">
                              ✓ Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/aspirants/${app.id}`);
                            }}
                            className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AspirantReview;
