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
  ExternalLink, Loader2, Filter, Search 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/NavLink";
import { Input } from "@/components/ui/input";

const DEPARTMENTS = [
  "All Departments",
  "Nursing Sciences",
  "Medical Laboratory Sciences",
  "Medicine and Surgery",
  "Community Medicine and Public Health",
  "Human Anatomy",
  "Human Physiology"
];

const LEVELS = ["All Levels", "100L", "200L", "300L", "400L", "500L"];

const StudentPortal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("course_outlines");

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to access the Student Portal");
        navigate("/voter/login");
        return;
      }
      fetchData();
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [resourcesRes, eventsRes] = await Promise.all([
        supabase.from('academic_resources').select('*').eq('is_active', true),
        supabase.from('events_gallery').select('*').eq('is_published', true).order('event_date', { ascending: false })
      ]);

      if (resourcesRes.data) setResources(resourcesRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesDept = selectedDept === "All Departments" || r.department === selectedDept;
    const matchesLevel = selectedLevel === "All Levels" || r.level === selectedLevel;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.course_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesLevel && matchesSearch;
  });

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
                <SelectTrigger className="w-full md:w-[200px]">
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
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2 bg-muted/50">
            <TabsTrigger value="course_outlines" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Course Outlines</span>
              <span className="sm:hidden">Outlines</span>
            </TabsTrigger>
            <TabsTrigger value="past_questions" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Past Questions</span>
              <span className="sm:hidden">PQs</span>
            </TabsTrigger>
            <TabsTrigger value="e_materials" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">E-Materials</span>
              <span className="sm:hidden">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="h-4 w-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          {/* Course Outlines */}
          <TabsContent value="course_outlines" className="mt-6">
            <ResourceGrid resources={getResourcesByType('course_outline')} type="Course Outline" />
          </TabsContent>

          {/* Past Questions */}
          <TabsContent value="past_questions" className="mt-6">
            <ResourceGrid resources={getResourcesByType('past_question')} type="Past Question" />
          </TabsContent>

          {/* E-Materials */}
          <TabsContent value="e_materials" className="mt-6">
            <ResourceGrid resources={getResourcesByType('e_material')} type="E-Material" />
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(e => e.event_type === 'event').length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events available yet</p>
                </div>
              ) : (
                events.filter(e => e.event_type === 'event').map(event => (
                  <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {event.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      {event.event_date && (
                        <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
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

          {/* Gallery */}
          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {events.filter(e => e.event_type === 'gallery').length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No gallery items available yet</p>
                </div>
              ) : (
                events.filter(e => e.event_type === 'gallery').map(item => (
                  <Card key={item.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all">
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
                {resource.course_code && (
                  <Badge variant="secondary" className="mt-1">{resource.course_code}</Badge>
                )}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="shrink-0"
                onClick={() => window.open(resource.external_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-1 rounded">{resource.department}</span>
              <span className="bg-muted px-2 py-1 rounded">{resource.level}</span>
              {resource.year && <span className="bg-muted px-2 py-1 rounded">{resource.year}</span>}
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
