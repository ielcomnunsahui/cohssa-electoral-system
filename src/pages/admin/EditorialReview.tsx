import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Check, X, Loader2, Newspaper, Eye, Clock, CheckCircle, XCircle,
  FileText, BookOpen, Feather, PenTool, User, Calendar
} from "lucide-react";

const CONTENT_TYPES = [
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "article", label: "Article", icon: FileText },
  { value: "research", label: "Research", icon: BookOpen },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "poem", label: "Poem", icon: Feather },
  { value: "writing", label: "Writing", icon: PenTool },
];

const EditorialReview = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('editorial_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (item: any) => {
    setSelectedContent(item);
    setAdminNotes("");
    setReviewDialogOpen(true);
  };

  const sendNotification = async (content: any, status: 'published' | 'rejected') => {
    if (!content.author_email) {
      console.log("No author email, skipping notification");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-editorial-notification', {
        body: {
          email: content.author_email,
          authorName: content.author_name || 'Author',
          contentTitle: content.title,
          contentType: content.content_type,
          status: status,
        },
      });

      if (error) {
        console.error("Failed to send notification:", error);
      } else {
        console.log("Notification sent successfully");
      }
    } catch (err) {
      console.error("Error invoking notification function:", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedContent) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('editorial_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', selectedContent.id);

      if (error) throw error;
      
      // Send email notification
      await sendNotification(selectedContent, 'published');
      
      toast.success("Content approved and published!");
      setReviewDialogOpen(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContent) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('editorial_content')
        .update({
          status: 'rejected'
        })
        .eq('id', selectedContent.id);

      if (error) throw error;
      
      // Send email notification
      await sendNotification(selectedContent, 'rejected');
      
      toast.success("Content rejected");
      setReviewDialogOpen(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    
    try {
      const { error } = await supabase
        .from('editorial_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Content deleted");
      fetchContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const getFilteredContent = (status: string) => {
    if (status === 'all') return content;
    return content.filter(c => c.status === status);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'published':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Published</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    const Icon = found?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Editorial Review</h1>
          <p className="text-muted-foreground">Review and manage student publications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{getFilteredContent('pending').length}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{getFilteredContent('published').length}</p>
            <p className="text-sm text-muted-foreground">Published</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{getFilteredContent('rejected').length}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{content.length}</p>
            <p className="text-sm text-muted-foreground">Total Submissions</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({getFilteredContent('pending').length})</TabsTrigger>
            <TabsTrigger value="published">Published ({getFilteredContent('published').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getFilteredContent('rejected').length})</TabsTrigger>
            <TabsTrigger value="all">All ({content.length})</TabsTrigger>
          </TabsList>

          {['pending', 'published', 'rejected', 'all'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredContent(tab).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.content_type)}
                              <span className="text-sm capitalize">{item.content_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium line-clamp-1">{item.title}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.author_name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.department || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleReview(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredContent(tab).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No content in this category
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>Review and approve or reject this content</DialogDescription>
            </DialogHeader>
            
            {selectedContent && (
              <div className="space-y-6 mt-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedContent.content_type)}
                  <Badge variant="secondary" className="capitalize">
                    {selectedContent.content_type}
                  </Badge>
                  {getStatusBadge(selectedContent.status)}
                </div>

                <div>
                  <h3 className="text-xl font-bold">{selectedContent.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedContent.author_name}
                    </span>
                    {selectedContent.department && (
                      <span>• {selectedContent.department}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedContent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {selectedContent.image_url && (
                  <img 
                    src={selectedContent.image_url} 
                    alt={selectedContent.title} 
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                )}

                <div className="prose dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedContent.content}
                  </pre>
                </div>

                {selectedContent.pdf_url && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Attached PDF:</p>
                    <a 
                      href={selectedContent.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View PDF Document
                    </a>
                  </div>
                )}

                {selectedContent.status === 'pending' && (
                  <div className="flex gap-4">
                    <Button onClick={handleApprove} disabled={processing} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve & Publish
                    </Button>
                    <Button onClick={handleReject} disabled={processing} variant="destructive" className="flex-1 gap-2">
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Reject
                    </Button>
                  </div>
                )}

                {selectedContent.status !== 'pending' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {selectedContent.status}
                    </p>
                    {selectedContent.published_at && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Published on {new Date(selectedContent.published_at).toLocaleDateString()}
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

export default EditorialReview;
