import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTour } from "@/hooks/useAdminTour";
import { 
  Check, X, Loader2, BookOpen, DollarSign, Eye, MessageSquare,
  Clock, CheckCircle, XCircle, Package
} from "lucide-react";

const TextbookManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTextbook, setSelectedTextbook] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [commission, setCommission] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('used_textbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTextbooks(data || []);
    } catch (error) {
      console.error("Error fetching textbooks:", error);
      toast.error("Failed to load textbooks");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (textbook: any) => {
    setSelectedTextbook(textbook);
    setCommission(textbook.commission?.toString() || "");
    setAdminNotes(textbook.admin_notes || "");
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedTextbook) return;
    if (!commission || parseFloat(commission) < 0) {
      toast.error("Please enter a valid commission amount");
      return;
    }

    setProcessing(true);
    try {
      const originalPrice = parseFloat(selectedTextbook.price);
      const commissionAmount = parseFloat(commission);
      const finalPrice = originalPrice + commissionAmount;

      const { error } = await (supabase as any)
        .from('used_textbooks')
        .update({
          status: 'approved',
          commission: commissionAmount,
          final_price: finalPrice,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedTextbook.id);

      if (error) throw error;
      
      toast.success("Textbook approved and listed for sale!");
      setReviewDialogOpen(false);
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTextbook) return;
    
    setProcessing(true);
    try {
      const { error } = await (supabase as any)
        .from('used_textbooks')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedTextbook.id);

      if (error) throw error;
      
      toast.success("Textbook rejected");
      setReviewDialogOpen(false);
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkSold = async (id: string) => {
    if (!confirm("Mark this textbook as sold?")) return;
    
    try {
      const { error } = await (supabase as any)
        .from('used_textbooks')
        .update({
          status: 'sold',
          sold_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Textbook marked as sold!");
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleMarkDelivered = async (id: string) => {
    if (!confirm("Mark this textbook as delivered?")) return;
    
    try {
      const { error } = await (supabase as any)
        .from('used_textbooks')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Textbook marked as delivered!");
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const getFilteredTextbooks = (status: string) => {
    if (status === 'all') return textbooks;
    return textbooks.filter(t => t.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'sold':
        return <Badge className="gap-1 bg-blue-500"><DollarSign className="h-3 w-3" />Sold</Badge>;
      case 'delivered':
        return <Badge className="gap-1 bg-purple-500"><Package className="h-3 w-3" />Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Textbook Marketplace</h1>
          <p className="text-muted-foreground">Review and manage student textbook listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{getFilteredTextbooks('pending').length}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{getFilteredTextbooks('approved').length}</p>
            <p className="text-sm text-muted-foreground">Listed for Sale</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{getFilteredTextbooks('sold').length}</p>
            <p className="text-sm text-muted-foreground">Sold</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{getFilteredTextbooks('delivered').length}</p>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{getFilteredTextbooks('rejected').length}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({getFilteredTextbooks('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Listed ({getFilteredTextbooks('approved').length})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({getFilteredTextbooks('sold').length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({getFilteredTextbooks('delivered').length})</TabsTrigger>
            <TabsTrigger value="all">All ({textbooks.length})</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'sold', 'delivered', 'all'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Final Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredTextbooks(tab).map((textbook) => (
                        <TableRow key={textbook.id}>
                          <TableCell>
                            {textbook.image_url ? (
                              <img src={textbook.image_url} alt={textbook.title} className="w-12 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium line-clamp-1">{textbook.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{textbook.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{textbook.seller_name}</p>
                              <p className="text-xs text-muted-foreground">{textbook.seller_matric}</p>
                            </div>
                          </TableCell>
                          <TableCell>₦{textbook.price?.toLocaleString()}</TableCell>
                          <TableCell>
                            {textbook.commission ? `₦${textbook.commission?.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {textbook.final_price ? `₦${textbook.final_price?.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(textbook.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleReview(textbook)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {textbook.status === 'approved' && (
                                <Button variant="outline" size="icon" onClick={() => handleMarkSold(textbook.id)} className="text-blue-500">
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                              {textbook.status === 'sold' && (
                                <Button variant="outline" size="icon" onClick={() => handleMarkDelivered(textbook.id)} className="text-purple-500">
                                  <Package className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredTextbooks(tab).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No textbooks in this category
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Textbook Listing</DialogTitle>
              <DialogDescription>Review and approve or reject this textbook listing</DialogDescription>
            </DialogHeader>
            
            {selectedTextbook && (
              <div className="space-y-6 mt-4">
                <div className="flex gap-6">
                  {selectedTextbook.image_url ? (
                    <img src={selectedTextbook.image_url} alt={selectedTextbook.title} className="w-32 h-40 object-cover rounded-lg" />
                  ) : (
                    <div className="w-32 h-40 bg-muted rounded-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedTextbook.title}</h3>
                    <p className="text-muted-foreground mt-2">{selectedTextbook.description}</p>
                    <div className="mt-4 space-y-1 text-sm">
                      <p><span className="font-medium">Seller:</span> {selectedTextbook.seller_name}</p>
                      <p><span className="font-medium">Matric:</span> {selectedTextbook.seller_matric}</p>
                      <p><span className="font-medium">Contact:</span> {selectedTextbook.seller_phone}</p>
                      <p><span className="font-medium">Department:</span> {selectedTextbook.seller_department}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Seller's Price</p>
                    <p className="text-xl font-bold">₦{selectedTextbook.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Commission</p>
                    <p className="text-xl font-bold text-primary">₦{commission || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Final Price (Buyer Pays)</p>
                    <p className="text-xl font-bold text-green-600">
                      ₦{(parseFloat(selectedTextbook.price || '0') + parseFloat(commission || '0')).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedTextbook.status === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <Label>Commission Amount (₦)</Label>
                      <Input
                        type="number"
                        value={commission}
                        onChange={(e) => setCommission(e.target.value)}
                        placeholder="Enter commission amount"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Admin Notes (optional)</Label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes for record keeping..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleApprove} disabled={processing} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Approve & List
                      </Button>
                      <Button onClick={handleReject} disabled={processing} variant="destructive" className="flex-1 gap-2">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        Reject
                      </Button>
                    </div>
                  </>
                )}

                {selectedTextbook.status !== 'pending' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm"><span className="font-medium">Status:</span> {selectedTextbook.status}</p>
                    {selectedTextbook.admin_notes && (
                      <p className="text-sm mt-2"><span className="font-medium">Admin Notes:</span> {selectedTextbook.admin_notes}</p>
                    )}
                    {selectedTextbook.reviewed_at && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Reviewed on {new Date(selectedTextbook.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TextbookManagement;
