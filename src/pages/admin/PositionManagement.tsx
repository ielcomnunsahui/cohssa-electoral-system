import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

import { DEPARTMENT_CODES, DepartmentCode } from "@/lib/constants";
type Department = DepartmentCode;
type Level = "100L" | "200L" | "300L" | "400L" | "500L";

const DEPARTMENTS: Department[] = [...DEPARTMENT_CODES];

const LEVELS: Level[] = ["100L", "200L", "300L", "400L", "500L"];

const PositionManagement = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    fee: 0,
    min_cgpa: 2.0,
    eligible_departments: [] as string[],
    eligible_levels: [] as string[],
    eligible_gender: "",
    max_candidates: 10,
    display_order: 1,
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPositions(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      fee: 0,
      min_cgpa: 2.0,
      eligible_departments: [],
      eligible_levels: [],
      eligible_gender: "",
      max_candidates: 10,
      display_order: positions.length + 1,
    });
    setEditingPosition(null);
  };

  const openEdit = (position: any) => {
    setEditingPosition(position);
    setForm({
      title: position.title || "",
      description: position.description || "",
      fee: position.fee || 0,
      min_cgpa: position.min_cgpa || 2.0,
      eligible_departments: position.eligible_departments || [],
      eligible_levels: position.eligible_levels || [],
      eligible_gender: position.eligible_gender || "",
      max_candidates: position.max_candidates || 10,
      display_order: position.display_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Position title is required");
      return;
    }

    try {
      const positionData = {
        title: form.title,
        description: form.description,
        fee: form.fee,
        min_cgpa: form.min_cgpa,
        eligible_departments: form.eligible_departments,
        eligible_levels: form.eligible_levels,
        eligible_gender: form.eligible_gender || null,
        max_candidates: form.max_candidates,
        display_order: form.display_order,
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('positions')
          .update(positionData)
          .eq('id', editingPosition.id);

        if (error) throw error;

        await logAction({
          action: 'position_update',
          entity_type: 'positions',
          entity_id: editingPosition.id,
          details: { title: form.title }
        });

        toast.success("Position updated");
      } else {
        const { error } = await supabase
          .from('positions')
          .insert({ ...positionData, is_active: true });

        if (error) throw error;

        await logAction({
          action: 'position_create',
          entity_type: 'positions',
          details: { title: form.title }
        });

        toast.success("Position created");
      }

      setDialogOpen(false);
      resetForm();
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_delete',
        entity_type: 'positions',
        entity_id: id,
        details: { title }
      });

      toast.success("Position deleted");
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const togglePosition = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('positions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_toggle',
        entity_type: 'positions',
        entity_id: id,
        details: { is_active: !isActive }
      });

      toast.success(isActive ? 'Position closed' : 'Position opened');
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleDepartment = (dept: string) => {
    setForm(prev => ({
      ...prev,
      eligible_departments: prev.eligible_departments.includes(dept)
        ? prev.eligible_departments.filter(d => d !== dept)
        : [...prev.eligible_departments, dept]
    }));
  };

  const toggleLevel = (level: string) => {
    setForm(prev => ({
      ...prev,
      eligible_levels: prev.eligible_levels.includes(level)
        ? prev.eligible_levels.filter(l => l !== level)
        : [...prev.eligible_levels, level]
    }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Position Management</CardTitle>
              <CardDescription>Manage election positions and eligibility criteria</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
                  <DialogDescription>Configure position details and eligibility criteria</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-y-auto pr-4 -mr-4">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position Title *</Label>
                        <Input 
                          value={form.title} 
                          onChange={(e) => setForm({...form, title: e.target.value})}
                          placeholder="e.g., President"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fee (₦)</Label>
                        <Input 
                          type="number"
                          value={form.fee} 
                          onChange={(e) => setForm({...form, fee: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={form.description} 
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        placeholder="Position description and responsibilities..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Min. CGPA</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          value={form.min_cgpa} 
                          onChange={(e) => setForm({...form, min_cgpa: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Candidates</Label>
                        <Input 
                          type="number"
                          value={form.max_candidates} 
                          onChange={(e) => setForm({...form, max_candidates: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender Restriction</Label>
                        <Select value={form.eligible_gender || "any"} onValueChange={(v) => setForm({...form, eligible_gender: v === "any" ? "" : v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="male">Male Only</SelectItem>
                            <SelectItem value="female">Female Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Eligible Departments</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {DEPARTMENTS.map(dept => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={form.eligible_departments.includes(dept)}
                              onCheckedChange={() => toggleDepartment(dept)}
                            />
                            <span className="text-sm">{dept}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Eligible Levels</Label>
                      <div className="flex gap-4 flex-wrap">
                        {LEVELS.map(level => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={form.eligible_levels.includes(level)}
                              onCheckedChange={() => toggleLevel(level)}
                            />
                            <span className="text-sm">{level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>{editingPosition ? "Update" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading positions...</p>
            ) : positions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No positions configured yet</p>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Min CGPA</TableHead>
                      <TableHead>Departments</TableHead>
                      <TableHead>Levels</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => (
                      <TableRow key={position.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{position.title}</TableCell>
                        <TableCell>₦{position.fee?.toLocaleString()}</TableCell>
                        <TableCell>{position.min_cgpa}</TableCell>
                        <TableCell>
                          {position.eligible_departments?.length > 0 
                            ? `${position.eligible_departments.length} dept(s)` 
                            : "All"}
                        </TableCell>
                        <TableCell>
                          {position.eligible_levels?.length > 0 
                            ? position.eligible_levels.join(", ") 
                            : "All"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={position.is_active}
                              onCheckedChange={() => togglePosition(position.id, position.is_active)}
                            />
                            <Badge variant={position.is_active ? "default" : "secondary"}>
                              {position.is_active ? "Open" : "Closed"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(position)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(position.id, position.title)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

export default PositionManagement;