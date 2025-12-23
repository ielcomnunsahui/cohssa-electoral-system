import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, BookOpen, FileText, GraduationCap, Calendar, Image, 
  ExternalLink, Loader2, Filter, Search, Newspaper, ShoppingBag,
  Video, Clock, MapPin, Tag, Phone, MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DEPARTMENTS = [
  "All Departments",
  "Library and Information Science",
  "Environmental Health",
  "Health Information Management",
  "Office Technology Management",
  "Mass Communication"
];

const LEVELS = ["All Levels", "100", "200", "300", "400"];

const RESOURCE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "past_question", label: "Past Questions" },
  { value: "study_material", label: "Study Materials" },
  { value: "ebook", label: "E-Books" },
  { value: "project", label: "Projects" },
  { value: "course_outline", label: "Course Outlines" },
  { value: "e_material", label: "E-Materials" },
];

const StudentPortal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [editorialContent, setEditorialContent] = useState<any[]>([]);
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("resources");
  
  // Sell textbook dialog
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    price: "",
    department: "",
    level: "",
    seller_name: "",
    seller_phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, eventsRes, editorialRes, textbooksRes] = await Promise.all([
        supabase.from('resources').select('*').eq('status', 'approved').neq('resource_type', 'textbook'),
        supabase.from('events').select('*').eq('is_published', true).order('start_date', { ascending: false }),
        supabase.from('editorial_content').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(6),
        supabase.from('resources').select('*').eq('status', 'approved').eq('resource_type', 'textbook').eq('is_sold', false)
      ]);

      if (resourcesRes.data) setResources(resourcesRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (editorialRes.data) setEditorialContent(editorialRes.data);
      if (textbooksRes.data) setTextbooks(textbooksRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesDept = selectedDept === "All Departments" || r.department === selectedDept;
    const matchesLevel = selectedLevel === "All Levels" || r.level === selectedLevel;
    const matchesType = selectedType === "all" || r.resource_type === selectedType;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesLevel && matchesType && matchesSearch;
  });

  const filteredTextbooks = textbooks.filter(t => {
    const matchesDept = selectedDept === "All Departments" || t.department === selectedDept;
    const matchesLevel = selectedLevel === "All Levels" || t.level === selectedLevel;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesLevel && matchesSearch;
  });

  const handleSellTextbook = async () => {
    if (!sellForm.title || !sellForm.price || !sellForm.seller_name || !sellForm.seller_phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('resources').insert({
        title: sellForm.title,
        description: sellForm.description,
        price: parseFloat(sellForm.price),
        department: sellForm.department || null,
        level: sellForm.level || null,
        seller_name: sellForm.seller_name,
        seller_phone: sellForm.seller_phone,
        resource_type: 'textbook',
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Textbook submitted for review! It will appear once approved.");
      setSellDialogOpen(false);
      setSellForm({ title: "", description: "", price: "", department: "", level: "", seller_name: "", seller_phone: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit textbook");
    } finally {
      setSubmitting(false);
    }
  };

  const getResourcesByType = (type: string) => filteredResources.filter(r => r.resource_type === type);

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
                Student Portal
              </h1>
              <p className="text-sm text-muted-foreground">Academic Resources & More</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </header>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => navigate('/editorial')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Newspaper className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Editorial</p>
                <p className="text-xs text-muted-foreground">Articles & News</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => setActiveTab('marketplace')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ShoppingBag className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Marketplace</p>
                <p className="text-xs text-muted-foreground">Used Textbooks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => setActiveTab('events')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Events</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => setActiveTab('webinars')}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Video className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Webinars</p>
                <p className="text-xs text-muted-foreground">Online Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-full md:w-[220px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l} value={l}>{l === "All Levels" ? l : `${l} Level`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="resources" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="webinars" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Webinars</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="editorial" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Editorial</span>
            </TabsTrigger>
          </TabsList>

          {/* All Resources */}
          <TabsContent value="resources" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ResourceGrid resources={filteredResources} type="Resource" />
          </TabsContent>

          {/* Marketplace - Textbook Buy/Sell */}
          <TabsContent value="marketplace" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Textbook Marketplace</h2>
                <p className="text-sm text-muted-foreground">Buy and sell used textbooks with fellow students</p>
              </div>
              <Button onClick={() => setSellDialogOpen(true)} className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Sell Textbook
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTextbooks.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No textbooks available</p>
                  <p className="text-sm mt-1">Be the first to list a textbook for sale!</p>
                  <Button onClick={() => setSellDialogOpen(true)} className="mt-4 gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Sell Your Textbook
                  </Button>
                </div>
              ) : (
                filteredTextbooks.map((book, index) => (
                  <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-8 w-8 text-primary/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                          <p className="text-2xl font-bold text-green-600 mt-1">₦{book.price?.toLocaleString()}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {book.department && <Badge variant="secondary" className="text-xs">{book.department}</Badge>}
                            {book.level && <Badge variant="outline" className="text-xs">{book.level} Level</Badge>}
                          </div>
                          {book.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">Seller: {book.seller_name}</p>
                          <div className="flex gap-2 mt-3">
                            {book.seller_phone && (
                              <>
                                <Button size="sm" variant="outline" className="gap-1 text-xs flex-1" onClick={() => window.open(`tel:${book.seller_phone}`)}>
                                  <Phone className="h-3 w-3" />
                                  Call
                                </Button>
                                <Button size="sm" variant="default" className="gap-1 text-xs flex-1" onClick={() => window.open(`https://wa.me/234${book.seller_phone.replace(/^0/, '')}?text=${encodeURIComponent(`Hi, I'm interested in buying "${book.title}" listed on COHSSA Marketplace.`)}`)}>
                                  <MessageCircle className="h-3 w-3" />
                                  WhatsApp
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(e => e.event_type === 'event' || !e.event_type).length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events available yet</p>
                </div>
              ) : (
                events.filter(e => e.event_type === 'event' || !e.event_type).map((event, index) => (
                  <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    {event.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      {event.start_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Webinars */}
          <TabsContent value="webinars" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(e => e.event_type === 'webinar').length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No webinars available yet</p>
                </div>
              ) : (
                events.filter(e => e.event_type === 'webinar').map((webinar, index) => (
                  <Card key={webinar.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    {webinar.image_url && (
                      <div className="aspect-video overflow-hidden relative">
                        <img src={webinar.image_url} alt={webinar.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Video className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">Webinar</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{webinar.title}</h3>
                      {webinar.start_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(webinar.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {webinar.highlights && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{webinar.highlights}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {events.filter(e => e.event_type === 'gallery').length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No gallery items available yet</p>
                </div>
              ) : (
                events.filter(e => e.event_type === 'gallery').map((item, index) => (
                  <Card key={item.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    {item.image_url && (
                      <div className="aspect-square overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Editorial Tab Content */}
        {activeTab === 'editorial' && (
          <section className="mt-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Editorial Content</h2>
              <Button variant="outline" onClick={() => navigate('/editorial')} className="gap-2">
                View All
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editorialContent.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No editorial content available yet</p>
                </div>
              ) : (
                editorialContent.map((item, index) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }} onClick={() => navigate('/editorial')}>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 capitalize">{item.content_type}</Badge>
                      <h3 className="font-semibold line-clamp-2 mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t mt-16">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-foreground">ISECO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Independent Students Electoral Committee • COHSSA
          </p>
        </footer>

        {/* Sell Textbook Dialog */}
        <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Sell Your Textbook
              </DialogTitle>
              <DialogDescription>
                List your textbook for sale. Your listing will be reviewed before appearing on the marketplace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Book Title *</Label>
                <Input
                  value={sellForm.title}
                  onChange={(e) => setSellForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Library Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={sellForm.description}
                  onChange={(e) => setSellForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the condition of the book..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₦) *</Label>
                  <Input
                    type="number"
                    value={sellForm.price}
                    onChange={(e) => setSellForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g., 2500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={sellForm.level} onValueChange={(v) => setSellForm(prev => ({ ...prev, level: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {["100", "200", "300", "400"].map(l => (
                        <SelectItem key={l} value={l}>{l} Level</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={sellForm.department} onValueChange={(v) => setSellForm(prev => ({ ...prev, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter(d => d !== "All Departments").map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Name *</Label>
                  <Input
                    value={sellForm.seller_name}
                    onChange={(e) => setSellForm(prev => ({ ...prev, seller_name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    value={sellForm.seller_phone}
                    onChange={(e) => setSellForm(prev => ({ ...prev, seller_phone: e.target.value }))}
                    placeholder="e.g., 08012345678"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSellDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSellTextbook} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Listing"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const ResourceGrid = ({ resources, type }: { resources: any[]; type: string }) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No {type.toLowerCase()}s available for the selected filters</p>
        <p className="text-sm">Try adjusting your filters or check back later</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource, index) => (
        <Card 
          key={resource.id} 
          className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {resource.title}
                </h3>
              </div>
              {(resource.file_url || resource.external_link) && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="shrink-0"
                  onClick={() => window.open(resource.file_url || resource.external_link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {resource.department && <span className="bg-muted px-2 py-1 rounded">{resource.department}</span>}
              {resource.level && <span className="bg-muted px-2 py-1 rounded">{resource.level}</span>}
            </div>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{resource.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentPortal;
