import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, Newspaper, FileText, BookOpen, Feather, PenTool, Send,
  Loader2, Calendar, User, Plus, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";

const CONTENT_TYPES = [
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "article", label: "Article", icon: FileText },
  { value: "research", label: "Research", icon: BookOpen },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "poem", label: "Poem", icon: Feather },
  { value: "writing", label: "Writing", icon: PenTool },
];

const Editorial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    content_type: "",
    author_name: "",
    author_matric: "",
    author_department: ""
  });

  useEffect(() => {
    fetchContent();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from('editorial_content')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data) setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = activeTab === "all" 
    ? content 
    : content.filter(c => c.content_type === activeTab);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit content");
      return;
    }

    if (!formData.title || !formData.content || !formData.content_type || !formData.author_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('editorial_content').insert({
        title: formData.title,
        content: formData.content,
        content_type: formData.content_type,
        author_name: formData.author_name,
        department: formData.author_department,
        user_id: user.id,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Content submitted for review! It will be published after approval.");
      setSubmitDialogOpen(false);
      setFormData({
        title: "",
        content: "",
        content_type: "",
        author_name: "",
        author_matric: "",
        author_department: ""
      });
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Failed to submit content. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                COHSSA Editorial
              </h1>
              <p className="text-sm text-muted-foreground">Newsletters, Articles & More</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Content</DialogTitle>
                  <DialogDescription>
                    Submit your content for review. It will be published after admin approval.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Content Type *</Label>
                    <Select 
                      value={formData.content_type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, content_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your content here..."
                      rows={10}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Author Name *</Label>
                      <Input
                        value={formData.author_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Matric Number</Label>
                      <Input
                        value={formData.author_matric}
                        onChange={(e) => setFormData(prev => ({ ...prev, author_matric: e.target.value }))}
                        placeholder="e.g., 21/08NUS014"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.author_department}
                        onChange={(e) => setFormData(prev => ({ ...prev, author_department: e.target.value }))}
                        placeholder="Your department"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit for Review
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="text-center mb-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Newspaper className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Student Publications</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Read the latest newsletters, articles, research papers, poems, and creative writings from COHSSA students.
          </p>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2 bg-muted/50 mb-8">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All
            </TabsTrigger>
            {CONTENT_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredContent.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Newspaper className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No content available yet</p>
                  <p className="text-sm mb-4">Be the first to submit!</p>
                  <Button onClick={() => setSubmitDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item, index) => {
                  const TypeIcon = CONTENT_TYPES.find(t => t.value === item.content_type)?.icon || FileText;
                  return (
                    <Card 
                      key={item.id} 
                      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedContent(item)}
                    >
                      {item.featured_image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={item.featured_image_url} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className="gap-1">
                            <TypeIcon className="h-3 w-3" />
                            {CONTENT_TYPES.find(t => t.value === item.content_type)?.label}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author_name}
                          </span>
                          {item.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Content Detail Dialog */}
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedContent && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {CONTENT_TYPES.find(t => t.value === selectedContent.content_type)?.label}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl">{selectedContent.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedContent.author_name}
                    </span>
                    {selectedContent.author_department && (
                      <span>• {selectedContent.author_department}</span>
                    )}
                    {selectedContent.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedContent.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                {selectedContent.featured_image_url && (
                  <img 
                    src={selectedContent.featured_image_url} 
                    alt={selectedContent.title} 
                    className="w-full rounded-lg"
                  />
                )}
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                  {selectedContent.content}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="text-center py-8 border-t mt-16 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-foreground">ISECO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Editorial;
