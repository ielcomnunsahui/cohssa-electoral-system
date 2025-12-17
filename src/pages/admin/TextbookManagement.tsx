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
  Check, X, Loader2, BookOpen, DollarSign, Eye, Plus,
  Clock, CheckCircle, XCircle, Package, Trash2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEPARTMENTS = [
  "Nursing Sciences",
  "Medical Laboratory Sciences",
  "Medicine and Surgery",
  "Community Medicine and Public Health",
  "Human Anatomy",
  "Human Physiology"
];

const LEVELS = ["100L", "200L", "300L", "400L", "500L"];

const TextbookManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedTextbook, setSelectedTextbook] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [commission, setCommission] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [newTextbook, setNewTextbook] = useState({
    title: "",
    description: "",
    price: "",
    seller_name: "",
    seller_phone: "",
    department: "",
    level: ""
  });

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('resource_type', 'textbook')
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
    setCommission(textbook.admin_commission?.toString() || "");
    setAdminNotes("");
    setReviewDialogOpen(true);
  };

  const handleAddTextbook = async () => {
    if (!newTextbook.title || !newTextbook.price || !newTextbook.seller_name) {
      toast.error("Please fill in required fields");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          title: newTextbook.title,
          description: newTextbook.description,
          price: parseFloat(newTextbook.price),
          seller_name: newTextbook.seller_name,
          seller_phone: newTextbook.seller_phone,
          department: newTextbook.department,
          level: newTextbook.level,
          resource_type: 'textbook',
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success("Textbook added successfully!");
      setAddDialogOpen(false);
      setNewTextbook({
        title: "",
        description: "",
        price: "",
        seller_name: "",
        seller_phone: "",
        department: "",
        level: ""
      });
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to add textbook");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTextbook) return;
    if (!commission || parseFloat(commission) < 0) {
      toast.error("Please enter a valid commission amount");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          status: 'approved',
          admin_commission: parseFloat(commission)
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
      const { error } = await supabase
        .from('resources')
        .update({
          status: 'rejected'
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
      const { error } = await supabase
        .from('resources')
        .update({
          is_sold: true
        })
        .eq('id', id);

      if (error) throw error;
      toast.success("Textbook marked as sold!");
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this textbook?")) return;
    
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Textbook deleted!");
      fetchTextbooks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const getFilteredTextbooks = (status: string) => {
    if (status === 'all') return textbooks;
    if (status === 'sold') return textbooks.filter(t => t.is_sold);
    return textbooks.filter(t => t.status === status && !t.is_sold);
  };

  const getStatusBadge = (textbook: any) => {
    if (textbook.is_sold) {
      return <Badge className="gap-1 bg-blue-500"><DollarSign className="h-3 w-3" />Sold</Badge>;
    }
    switch (textbook.status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Listed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge>{textbook.status}</Badge>;
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Textbook Marketplace</h1>
            <p className="text-muted-foreground">Review and manage student textbook listings</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Textbook
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <p className="text-2xl font-bold text-primary">{textbooks.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({getFilteredTextbooks('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Listed ({getFilteredTextbooks('approved').length})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({getFilteredTextbooks('sold').length})</TabsTrigger>
            <TabsTrigger value="all">All ({textbooks.length})</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'sold', 'all'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredTextbooks(tab).map((textbook) => (
                        <TableRow key={textbook.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium line-clamp-1">{textbook.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{textbook.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{textbook.seller_name}</p>
                              <p className="text-xs text-muted-foreground">{textbook.seller_phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>₦{textbook.price?.toLocaleString()}</TableCell>
                          <TableCell>
                            {textbook.admin_commission ? `₦${textbook.admin_commission?.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>{textbook.department || '-'}</TableCell>
                          <TableCell>{getStatusBadge(textbook)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleReview(textbook)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {textbook.status === 'approved' && !textbook.is_sold && (
                                <Button variant="outline" size="icon" onClick={() => handleMarkSold(textbook.id)} className="text-blue-500">
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="icon" onClick={() => handleDelete(textbook.id)} className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredTextbooks(tab).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Textbook</DialogTitle>
              <DialogDescription>Add a textbook listing to the marketplace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={newTextbook.title}
                  onChange={(e) => setNewTextbook(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter textbook title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTextbook.description}
                  onChange={(e) => setNewTextbook(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦) *</Label>
                  <Input
                    type="number"
                    value={newTextbook.price}
                    onChange={(e) => setNewTextbook(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seller Name *</Label>
                  <Input
                    value={newTextbook.seller_name}
                    onChange={(e) => setNewTextbook(prev => ({ ...prev, seller_name: e.target.value }))}
                    placeholder="Seller's name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seller Phone</Label>
                  <Input
                    value={newTextbook.seller_phone}
                    onChange={(e) => setNewTextbook(prev => ({ ...prev, seller_phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select 
                    value={newTextbook.department} 
                    onValueChange={(v) => setNewTextbook(prev => ({ ...prev, department: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select 
                  value={newTextbook.level} 
                  onValueChange={(v) => setNewTextbook(prev => ({ ...prev, level: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTextbook} disabled={processing} className="w-full gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Textbook
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Textbook Listing</DialogTitle>
              <DialogDescription>Review and approve or reject this textbook listing</DialogDescription>
            </DialogHeader>
            
            {selectedTextbook && (
              <div className="space-y-6 mt-4">
                <div className="flex gap-6">
                  {selectedTextbook.file_url ? (
                    <img src={selectedTextbook.file_url} alt={selectedTextbook.title} className="w-32 h-40 object-cover rounded-lg" />
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
                      <p><span className="font-medium">Contact:</span> {selectedTextbook.seller_phone}</p>
                      <p><span className="font-medium">Department:</span> {selectedTextbook.department}</p>
                      <p><span className="font-medium">Level:</span> {selectedTextbook.level}</p>
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
                    <p className="text-sm text-muted-foreground">Final Price</p>
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
                    <p className="text-sm"><span className="font-medium">Status:</span> {selectedTextbook.is_sold ? 'Sold' : selectedTextbook.status}</p>
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
