import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Plus, Pencil, Trash2, Calendar, Clock, CheckCircle, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTour, timelineManagementTourSteps } from "@/hooks/useAdminTour";
import SEO from "@/components/SEO";

type Timeline = Database['public']['Tables']['election_timeline']['Row'];

const TimelineManagement = () => {
  const { startTour } = useAdminTour({
    tourKey: 'timeline_management',
    steps: timelineManagementTourSteps,
    autoStart: false,
  });
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

  const getStageStatus = (timeline: Timeline) => {
    const now = new Date();
    const start = new Date(timeline.start_date);
    const end = timeline.end_date ? new Date(timeline.end_date) : null;
    
    if (timeline.is_active && (!end || now <= end)) {
      return { label: "Active", color: "bg-green-500/10 text-green-600 border-green-200" };
    }
    if (end && now > end) {
      return { label: "Completed", color: "bg-muted text-muted-foreground" };
    }
    if (now < start) {
      return { label: "Upcoming", color: "bg-blue-500/10 text-blue-600 border-blue-200" };
    }
    return { label: "Inactive", color: "bg-amber-500/10 text-amber-600 border-amber-200" };
  };

  return (
    <AdminLayout onStartTour={startTour}>
      <SEO 
        title="Timeline Management" 
        description="Manage election timeline stages - control when voter registration, candidate applications, and voting periods are active."
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold">Election Timeline</h1>
            <p className="text-muted-foreground">Control election stages and public visibility</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-tour="add-stage">
                <Plus className="h-4 w-4" />
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
                  <Label>Stage Name (for system)</Label>
                  <Input 
                    value={form.stage_name}
                    onChange={(e) => setForm(prev => ({ ...prev, stage_name: e.target.value }))}
                    placeholder="e.g., registration, voting, results"
                  />
                  <p className="text-xs text-muted-foreground">Used to control feature availability (voter, aspirant, voting, results)</p>
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
                <div className="grid grid-cols-2 gap-4">
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Stage</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{timelines.length}</p>
                <p className="text-xs text-muted-foreground">Total Stages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{timelines.filter(t => t.is_active).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{timelines.filter(t => t.is_publicly_visible).length}</p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {timelines.filter(t => new Date(t.start_date) > new Date()).length}
                </p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Table */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }} data-tour="timeline-list">
          <CardHeader>
            <CardTitle>Timeline Stages</CardTitle>
            <CardDescription>Manage election stages, their timing, and visibility</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Title</TableHead>
                      <TableHead>Stage Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead data-tour="stage-controls">Active</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timelines.map((timeline, index) => {
                      const status = getStageStatus(timeline);
                      return (
                        <TableRow 
                          key={timeline.id} 
                          className="hover:bg-muted/50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <TableCell className="font-medium">{timeline.title}</TableCell>
                          <TableCell>
                            {timeline.stage_name ? (
                              <Badge variant="outline">{timeline.stage_name}</Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {timeline.start_date ? new Date(timeline.start_date).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {timeline.end_date ? new Date(timeline.end_date).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
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
                              className={timeline.is_publicly_visible ? "text-green-500 hover:text-green-600" : "text-muted-foreground"}
                            >
                              {timeline.is_publicly_visible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEdit(timeline)} className="hover:bg-primary/10">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(timeline.id, timeline.title)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {timelines.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No timeline stages yet. Click "Add Stage" to create one.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TimelineManagement;
