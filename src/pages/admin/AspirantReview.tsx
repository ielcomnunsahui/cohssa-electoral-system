import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";

const AspirantReview = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('aspirant_applications')
        .select(`
          *,
          aspirant_positions(position_name, fee)
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      submitted: "outline",
      payment_verified: "secondary",
      under_review: "default",
      screening_scheduled: "default",
      screening_completed: "default",
      qualified: "default",
      disqualified: "destructive",
      candidate: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Aspirant Applications Review</CardTitle>
            <CardDescription>Manage payment verification, screening, and candidate promotion</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-muted-foreground">No applications yet</p>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Matric</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell className="font-mono text-sm">{app.matric}</TableCell>
                        <TableCell>{app.aspirant_positions?.position_name}</TableCell>
                        <TableCell>{app.cgpa?.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.payment_verified ? (
                            <Badge variant="default">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/aspirants/${app.id}`)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
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
