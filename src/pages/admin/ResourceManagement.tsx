import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTour } from "@/hooks/useAdminTour";
import { 
  Plus, Edit, Trash2, Loader2, BookOpen, FileText, GraduationCap, 
  ExternalLink, Save, Lightbulb, FileQuestion, Youtube, Link
} from "lucide-react";

const DEPARTMENTS = [
  "Nursing Sciences",
  "Medical Laboratory Sciences",
  "Medicine and Surgery",
  "Community Medicine and Public Health",
  "Human Anatomy",
  "Human Physiology"
];

const LEVELS = ["100L", "200L", "300L", "400L", "500L"];

const RESOURCE_TYPES = [
  { value: "course_outline", label: "Course Outline", icon: BookOpen },
  { value: "past_question", label: "Past Question", icon: FileQuestion },
  { value: "e_material", label: "E-Material", icon: FileText },
  { value: "tutorial", label: "Tutorial Highlight", icon: Lightbulb },
  { value: "key_points", label: "Key Points", icon: Lightbulb },
  { value: "revision_notes", label: "Revision Notes", icon: FileText },
  { value: "non_academic", label: "Non-Academic Book", icon: GraduationCap },
];

const NON_ACADEMIC_CATEGORIES = [
  "Time Management",
  "Creativity",
  "Financial Literacy",
  "Digital Skills",
  "Leadership",
  "Personal Development"
];

const ResourceManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("course_outline");
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    resource_type: 'course_outline',
    department: '',
    level: '',
    course_code: '',
    external_url: '',
    youtube_url: '',
    drive_url: '',
    year: '',
    category: '',
    is_active: true
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      resource_type: activeTab,
      department: '',
      level: '',
      course_code: '',
      external_url: '',
      youtube_url: '',
      drive_url: '',
      year: '',
      category: '',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('academic_resources')
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Resource updated");
      } else {
        const { error } = await supabase
          .from('academic_resources')
          .insert(formData);
        if (error) throw error;
        toast.success("Resource added");
      }
      
      setDialogOpen(false);
      fetchResources();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      const { error } = await supabase.from('academic_resources').delete().eq('id', id);
      if (error) throw error;
      toast.success("Resource deleted");
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('academic_resources')
        .update({ is_active: !currentValue })
        .eq('id', id);
      if (error) throw error;
      fetchResources();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const getFilteredResources = (type: string) => resources.filter(r => r.resource_type === type);

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
          <h1 className="text-2xl font-bold">Academic Resources</h1>
          <p className="text-muted-foreground">Manage course materials, past questions, tutorials, and more</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2 h-auto p-2 mb-6">
            {RESOURCE_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.value} value={type.value} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {RESOURCE_TYPES.map(type => (
            <TabsContent key={type.value} value={type.value}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{type.label}s</CardTitle>
                    <CardDescription>
                      {getFilteredResources(type.value).length} items
                    </CardDescription>
                  </div>
                  <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add {type.label}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredResources(type.value).map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{resource.title}</TableCell>
                          <TableCell>{resource.department || '-'}</TableCell>
                          <TableCell>{resource.level || '-'}</TableCell>
                          <TableCell>{resource.course_code || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {resource.external_url && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                    <Link className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {resource.youtube_url && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={resource.youtube_url} target="_blank" rel="noopener noreferrer">
                                    <Youtube className="h-4 w-4 text-red-500" />
                                  </a>
                                </Button>
                              )}
                              {resource.drive_url && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={resource.drive_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 text-blue-500" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={resource.is_active} 
                              onCheckedChange={() => toggleActive(resource.id, resource.is_active)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(resource)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(resource.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredResources(type.value).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No {type.label.toLowerCase()}s added yet
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

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Resource</DialogTitle>
              <DialogDescription>Fill in the resource details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Resource Type</Label>
                <Select value={formData.resource_type} onValueChange={(v) => setFormData({ ...formData, resource_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              {formData.resource_type !== 'non_academic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={formData.department || ''} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={formData.level || ''} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course Code</Label>
                    <Input
                      value={formData.course_code || ''}
                      onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                      placeholder="e.g., NUS101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g., 2023/2024"
                    />
                  </div>
                </div>
              )}

              {formData.resource_type === 'non_academic' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category || ''} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {NON_ACADEMIC_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Resource Links</h4>
                <div className="space-y-2">
                  <Label>External URL</Label>
                  <Input
                    value={formData.external_url || ''}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={formData.youtube_url || ''}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Google Drive URL</Label>
                  <Input
                    value={formData.drive_url || ''}
                    onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active (visible to students)</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingItem ? 'Update' : 'Add'} Resource
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ResourceManagement;
