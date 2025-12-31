import { useState, useEffect, useRef } from "react";
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
  Loader2, Calendar, User, Plus, Eye, Upload, Image as ImageIcon,
  Share2, Copy, MessageCircle, LogIn
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo, DualLogo } from "@/components/NavLink";
import { SEO } from "@/components/SEO";

const CONTENT_TYPES = [
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "article", label: "Article", icon: FileText },
  { value: "research", label: "Research", icon: BookOpen },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "poem", label: "Poem", icon: Feather },
  { value: "writing", label: "Writing", icon: PenTool },
];

import { DEPARTMENTS } from "@/lib/constants";

const Editorial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    content_type: "",
    author_name: "",
    author_matric: "",
    author_department: "",
    image_url: ""
  });

    // Deep linking logic: Open content if ID is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    if (contentId && content.length > 0) {
      const item = content.find(c => c.id === contentId);
      if (item) setSelectedContent(item);
    }
  }, [content]);


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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      setPreviewUrl(dataUrl);
      setFormData(prev => ({ ...prev, image_url: dataUrl }));
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

    const handleShare = async (item: any) => {
    const shareUrl = `https://cohssahui.org/editorial?id=${item.id}`;
    const shareText = `📝 Read "${item.title}" by ${item.author_name} on COHSSA Editorial.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: shareText, url: shareUrl });
      } catch (err) { console.log("Share failed", err); }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const shareToWhatsApp = (item: any) => {
    const text = encodeURIComponent(`*${item.title}*\nBy ${item.author_name}\n\nRead more on COHSSA Editorial:\nhttps://cohssahui.org/editorial?id=${item.id}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };


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
        image_url: formData.image_url || null,
        user_id: user.id,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Content submitted for review! It will be published after approval.");
      setSubmitDialogOpen(false);
      setPreviewUrl(null);
      setFormData({
        title: "",
        content: "",
        content_type: "",
        author_name: "",
        author_matric: "",
        author_department: "",
        image_url: ""
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
      <SEO 
        title="COHSSA Editorial" 
        description="Read newsletters, articles, research papers, poems, and creative writings from COHSSA students at Al-Hikmah University."
        keywords="COHSSA editorial, student publications, newsletters, articles, Al-Hikmah University"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <DualLogo className="h-10 w-auto" />
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
                {!user ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Sign In to Submit Content</DialogTitle>
                      <DialogDescription>
                        You need to sign in before submitting your articles, poems, research papers and more.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Welcome, Author!</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Sign in to submit content for review and publication.
                        </p>
                      </div>
                      <div className="space-y-4 max-w-sm mx-auto">
                        <Input
                          type="email"
                          placeholder="Email address"
                          id="editorial-email"
                          className="w-full"
                        />
                        <Input
                          type="password"
                          placeholder="Password"
                          id="editorial-password"
                          className="w-full"
                        />
                        <Button 
                          size="lg"
                          onClick={async () => {
                            const email = (document.getElementById('editorial-email') as HTMLInputElement)?.value;
                            const password = (document.getElementById('editorial-password') as HTMLInputElement)?.value;
                            if (!email || !password) {
                              toast.error("Please enter email and password");
                              return;
                            }
                            const { error } = await supabase.auth.signInWithPassword({ email, password });
                            if (error) {
                              if (error.message.includes("Invalid login")) {
                                toast.error("Invalid email or password");
                              } else {
                                toast.error(error.message);
                              }
                            } else {
                              toast.success("Signed in successfully");
                              checkUser();
                            }
                          }} 
                          className="w-full gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          Sign In
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Don't have an account?{" "}
                          <button
                            className="text-primary hover:underline"
                            onClick={async () => {
                              const email = (document.getElementById('editorial-email') as HTMLInputElement)?.value;
                              const password = (document.getElementById('editorial-password') as HTMLInputElement)?.value;
                              if (!email || !password) {
                                toast.error("Please enter email and password");
                                return;
                              }
                              if (password.length < 6) {
                                toast.error("Password must be at least 6 characters");
                                return;
                              }
                              const { error } = await supabase.auth.signUp({ 
                                email, 
                                password,
                                options: { emailRedirectTo: `${window.location.origin}/editorial` }
                              });
                              if (error) {
                                toast.error(error.message);
                              } else {
                                toast.success("Account created! You can now sign in.");
                              }
                            }}
                          >
                            Sign up
                          </button>
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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

                      {/* Photo Upload Section */}
                      <div className="space-y-3">
                        <Label>Featured Image (Optional)</Label>
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="w-32 h-24 rounded-lg object-cover border-2 border-primary" />
                            ) : (
                              <div className="w-32 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full gap-2"
                            >
                              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              {uploading ? 'Uploading...' : 'Upload Photo'}
                            </Button>
                            <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG. Optional but recommended for articles.</p>
                          </div>
                        </div>
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
                          <Select 
                            value={formData.author_department} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, author_department: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Submit for Review
                      </Button>
                    </div>
                  </>
                )}
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
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Read the latest newsletters, articles, research papers, poems, and creative writings from COHSSA students.
          </p>
          
          {/* Sign In Card for Submissions */}
          {!user && (
            <Card className="max-w-md mx-auto border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Want to Submit Content?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign in to submit your articles, poems, research papers and more for publication.
                </p>
                <Button onClick={() => setSubmitDialogOpen(true)} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In to Submit
                </Button>
              </CardContent>
            </Card>
          )}
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
                      {item.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={item.image_url} 
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
        <Dialog open={!!selectedContent} onOpenChange={() => {
          setSelectedContent(null);
          window.history.pushState({}, '', '/editorial'); // Clean URL on close
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedContent && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{selectedContent.content_type}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(selectedContent)}>
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </div>
                  <DialogTitle className="text-3xl mt-2">{selectedContent.title}</DialogTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground py-2">
                    <span className="flex items-center"><User className="h-4 w-4 mr-1" /> {selectedContent.author_name}</span>
                    <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(selectedContent.published_at).toLocaleDateString()}</span>
                  </div>
                </DialogHeader>
                
                {selectedContent.image_url && <img src={selectedContent.image_url} alt="content image" className="w-full rounded-lg mb-6" />}
                
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                  {selectedContent.content}
                </div>

                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="font-bold">Share this work</p>
                    <p className="text-xs text-muted-foreground">Support our student authors.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleShare(selectedContent)}>
                      <Copy className="h-4 w-4 mr-2" /> Copy Link
                    </Button>
                    <Button className="bg-[#25D366] hover:bg-[#1da851]" onClick={() => shareToWhatsApp(selectedContent)}>
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </Button>
                  </div>
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
