import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Plus, Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";

type Timeline = Database['public']['Tables']['election_timeline']['Row'];

const TimelineManagement = () => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Timeline | null>(null);
  const [form, setForm] = useState({
    stage_name: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    try {
      const { data, error } = await supabase
        .from('election_timeline')
        .select('*')
        .order('start_time');

      if (error) throw error;
      setTimelines(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ stage_name: "", start_time: "", end_time: "" });
    setEditing(null);
  };

  const openEdit = (timeline: Timeline) => {
    setEditing(timeline);
    setForm({
      stage_name: timeline.stage_name,
      start_time: new Date(timeline.start_time).toISOString().slice(0, 16),
      end_time: new Date(timeline.end_time).toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.stage_name || !form.start_time || !form.end_time) {
      toast.error("All fields are required");
      return;
    }

    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('election_timeline')
          .update({
            stage_name: form.stage_name,
            start_time: new Date(form.start_time).toISOString(),
            end_time: new Date(form.end_time).toISOString(),
          })
          .eq('id', editing.id);

        if (error) throw error;

        await logAction({
          action: 'timeline_update',
          entity_type: 'election_timeline',
          entity_id: editing.id,
          details: { stage_name: form.stage_name }
        });

        toast.success("Timeline updated");
      } else {
        const { error } = await supabase
          .from('election_timeline')
          .insert({
            stage_name: form.stage_name,
            start_time: new Date(form.start_time).toISOString(),
            end_time: new Date(form.end_time).toISOString(),
            is_active: false,
            is_publicly_visible: false,
          });

        if (error) throw error;

        await logAction({
          action: 'timeline_create',
          entity_type: 'election_timeline',
          details: { stage_name: form.stage_name }
        });

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

      await logAction({
        action: 'timeline_toggle',
        entity_type: 'election_timeline',
        entity_id: id,
        details: { action: 'deleted', name }
      });

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

      await logAction({
        action: 'timeline_toggle',
        entity_type: 'election_timeline',
        entity_id: id,
        details: { is_active: !isActive }
      });

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

      await logAction({
        action: 'timeline_update',
        entity_type: 'election_timeline',
        entity_id: id,
        details: { is_publicly_visible: !isVisible }
      });

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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit" : "Add"} Timeline Stage</DialogTitle>
                  <DialogDescription>Configure the election stage details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Stage Name</Label>
                    <Input 
                      value={form.stage_name}
                      onChange={(e) => setForm(prev => ({ ...prev, stage_name: e.target.value }))}
                      placeholder="e.g., Aspirant Registration"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input 
                      type="datetime-local"
                      value={form.start_time}
                      onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input 
                      type="datetime-local"
                      value={form.end_time}
                      onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
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
                    <TableHead>Stage Name</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Public</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timelines.map((timeline) => (
                    <TableRow key={timeline.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{timeline.stage_name}</TableCell>
                      <TableCell>{new Date(timeline.start_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(timeline.end_time).toLocaleString()}</TableCell>
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
                            <Eye className="h-4 w-4 text-success" />
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
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(timeline.id, timeline.stage_name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {timelines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
