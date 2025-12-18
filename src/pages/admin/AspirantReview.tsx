import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Filter, FileText, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTour, aspirantReviewTourSteps } from "@/hooks/useAdminTour";
import SEO from "@/components/SEO";

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
      const { data, error } = await supabase
        .from('aspirants')
        .select(`
          *,
          positions(title, fee)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
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
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; color: string }> = {
      pending: { variant: "outline", icon: Clock, color: "text-amber-500" },
      submitted: { variant: "secondary", icon: FileText, color: "text-blue-500" },
      under_review: { variant: "default", icon: Eye, color: "text-purple-500" },
      approved: { variant: "default", icon: UserCheck, color: "text-green-500" },
      rejected: { variant: "destructive", icon: UserX, color: "text-red-500" },
    };
    const { variant, icon: Icon, color } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
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
            <h1 className="text-3xl font-bold">Aspirant Applications</h1>
            <p className="text-muted-foreground">Review and manage candidate applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {applications.length} Total Applications
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            { label: "Pending", value: statusCounts.pending, color: "bg-amber-500/10 text-amber-600", icon: Clock },
            { label: "Submitted", value: statusCounts.submitted, color: "bg-blue-500/10 text-blue-600", icon: FileText },
            { label: "Under Review", value: statusCounts.under_review, color: "bg-purple-500/10 text-purple-600", icon: Eye },
            { label: "Approved", value: statusCounts.approved, color: "bg-green-500/10 text-green-600", icon: UserCheck },
            { label: "Rejected", value: statusCounts.rejected, color: "bg-red-500/10 text-red-600", icon: UserX },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label} 
                className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
                onClick={() => setStatusFilter(stat.label.toLowerCase().replace(' ', '_'))}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }} data-tour="aspirant-filters">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, matric, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
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
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }} data-tour="aspirant-list">
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>Click on any row to review full application details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {applications.length === 0 ? "No applications yet" : "No applications match your filters"}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Matric No.</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead data-tour="aspirant-actions">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app, index) => (
                      <TableRow 
                        key={app.id} 
                        className="hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => navigate(`/admin/aspirants/${app.id}`)}
                      >
                        <TableCell className="font-medium">{app.full_name || app.name}</TableCell>
                        <TableCell className="font-mono text-sm">{app.matric_number}</TableCell>
                        <TableCell>{app.positions?.title || '-'}</TableCell>
                        <TableCell>{app.cgpa?.toFixed(2) || '-'}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.payment_proof_url ? (
                            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200">
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/aspirants/${app.id}`);
                            }}
                            className="gap-1 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Eye className="h-3 w-3" />
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
