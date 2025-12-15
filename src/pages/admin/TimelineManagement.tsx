import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";

type Timeline = Database['public']['Tables']['election_timeline']['Row'];

const TimelineManagement = () => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Timeline | null>(null);
  const [form, setForm] = useState({
    title: "",
    stage_name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    try {
      const { data, error } = await supabase
        .from('election_timeline')
        .select('*')
        .order('start_date');

      if (error) throw error;
      setTimelines(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ title: "", stage_name: "", description: "", start_date: "", end_date: "" });
    setEditing(null);
  };

  const openEdit = (timeline: Timeline) => {
    setEditing(timeline);
    setForm({
      title: timeline.title || "",
      stage_name: timeline.stage_name || "",
      description: timeline.description || "",
      start_date: timeline.start_date ? new Date(timeline.start_date).toISOString().slice(0, 16) : "",
      end_date: timeline.end_date ? new Date(timeline.end_date).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.start_date) {
      toast.error("Title and start date are required");
      return;
    }

    if (form.end_date && new Date(form.end_date) <= new Date(form.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('election_timeline')
          .update({
            title: form.title,
            stage_name: form.stage_name || null,
            description: form.description || null,
            start_date: new Date(form.start_date).toISOString(),
            end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success("Timeline updated");
      } else {
        const { error } = await supabase
          .from('election_timeline')
          .insert({
            title: form.title,
            stage_name: form.stage_name || null,
            description: form.description || null,
            start_date: new Date(form.start_date).toISOString(),
            end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
            is_active: false,
            is_publicly_visible: false,
          });

        if (error) throw error;
        toast.success("Timeline created");
      }

      setDialogOpen(false);
      resetForm();
      loadTimelines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('election_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Timeline deleted");
      loadTimelines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('election_timeline')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? 'Stage deactivated' : 'Stage activated');
      loadTimelines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('election_timeline')
        .update({ is_publicly_visible: !isVisible })
        .eq('id', id);

      if (error) throw error;
      toast.success(isVisible ? 'Stage hidden from public' : 'Stage visible to public');
      loadTimelines();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Election Timeline Management</CardTitle>
              <CardDescription>Control election stages and public visibility</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit" : "Add"} Timeline Stage</DialogTitle>
                  <DialogDescription>Configure the election stage details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input 
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Aspirant Registration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stage Name</Label>
                    <Input 
                      value={form.stage_name}
                      onChange={(e) => setForm(prev => ({ ...prev, stage_name: e.target.value }))}
                      placeholder="e.g., registration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this stage..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date & Time *</Label>
                    <Input 
                      type="datetime-local"
                      value={form.start_date}
                      onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time</Label>
                    <Input 
                      type="datetime-local"
                      value={form.end_date}
                      onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Stage</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Stage Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Public</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timelines.map((timeline) => (
                    <TableRow key={timeline.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{timeline.title}</TableCell>
                      <TableCell>{timeline.stage_name || '-'}</TableCell>
                      <TableCell>{timeline.start_date ? new Date(timeline.start_date).toLocaleString() : '-'}</TableCell>
                      <TableCell>{timeline.end_date ? new Date(timeline.end_date).toLocaleString() : '-'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={timeline.is_active || false}
                          onCheckedChange={() => toggleActive(timeline.id, timeline.is_active || false)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(timeline.id, timeline.is_publicly_visible || false)}
                        >
                          {timeline.is_publicly_visible ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(timeline)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(timeline.id, timeline.title)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {timelines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No timeline stages yet. Click "Add Stage" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TimelineManagement;