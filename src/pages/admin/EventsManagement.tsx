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
  Plus, Edit, Trash2, Loader2, Calendar, Image, Video, 
  Save, Eye, Megaphone
} from "lucide-react";

const EVENT_TYPES = [
  { value: "event", label: "Event" },
  { value: "webinar", label: "Webinar" },
  { value: "gallery", label: "Gallery" },
];

const EventsManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("event");
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    event_type: 'event',
    start_date: '',
    end_date: '',
    location: '',
    image_url: '',
    highlights: '',
    is_published: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      event_type: activeTab,
      start_date: '',
      end_date: '',
      location: '',
      image_url: '',
      highlights: '',
      is_published: false
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      ...item,
      start_date: item.start_date ? new Date(item.start_date).toISOString().slice(0, 16) : '',
      end_date: item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        location: formData.location,
        image_url: formData.image_url,
        highlights: formData.highlights,
        is_published: formData.is_published
      };

      if (editingItem) {
        const { error } = await supabase
          .from('events')
          .update(dataToSave)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Event updated");
      } else {
        const { error } = await supabase
          .from('events')
          .insert(dataToSave);
        if (error) throw error;
        toast.success("Event added");
      }
      
      setDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success("Item deleted");
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const togglePublished = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !currentValue })
        .eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const getFilteredEvents = (type: string) => events.filter(e => e.event_type === type);

  const isUpcoming = (date: string) => {
    if (!date) return false;
    return new Date(date) > new Date();
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
          <h1 className="text-2xl font-bold">Events & Gallery</h1>
          <p className="text-muted-foreground">Manage events, webinars, and photo gallery</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="event" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events ({getFilteredEvents('event').length})
            </TabsTrigger>
            <TabsTrigger value="webinar" className="gap-2">
              <Video className="h-4 w-4" />
              Webinars ({getFilteredEvents('webinar').length})
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              Gallery ({getFilteredEvents('gallery').length})
            </TabsTrigger>
          </TabsList>

          {EVENT_TYPES.map(type => (
            <TabsContent key={type.value} value={type.value}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{type.label}s</CardTitle>
                    <CardDescription>
                      {getFilteredEvents(type.value).length} items
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
                        <TableHead>Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredEvents(type.value).map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.title} className="w-16 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                                <Image className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{event.title}</TableCell>
                          <TableCell>
                            {event.start_date ? new Date(event.start_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{event.location || '-'}</TableCell>
                          <TableCell>
                            {isUpcoming(event.start_date) ? (
                              <Badge className="bg-blue-500">Upcoming</Badge>
                            ) : (
                              <Badge variant="secondary">Past</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={event.is_published} 
                              onCheckedChange={() => togglePublished(event.id, event.is_published)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(event)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(event.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getFilteredEvents(type.value).length === 0 && (
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
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'event' ? 'Event' : activeTab === 'webinar' ? 'Webinar' : 'Gallery Item'}</DialogTitle>
              <DialogDescription>Fill in the details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
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
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location or online link"
                />
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {(formData.event_type === 'webinar' || formData.event_type === 'event') && (
                <div className="space-y-2">
                  <Label>Highlights (after event)</Label>
                  <Textarea
                    value={formData.highlights || ''}
                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                    placeholder="Key takeaways, summary, highlights..."
                    rows={4}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.is_published} 
                  onCheckedChange={(v) => setFormData({ ...formData, is_published: v })}
                />
                <Label>Published (visible to public)</Label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EventsManagement;