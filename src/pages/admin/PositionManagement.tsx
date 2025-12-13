import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type AspirantPosition = Database['public']['Tables']['aspirant_positions']['Row'];
type VotingPosition = Database['public']['Tables']['voting_positions']['Row'];

type Department = "Nursing Sciences" | "Medical Laboratory Sciences" | "Medicine and Surgery" | "Community Medicine and Public Health" | "Human Anatomy" | "Human Physiology";
type Level = "100L" | "200L" | "300L" | "400L" | "500L";
type Gender = "male" | "female";

const DEPARTMENTS: Department[] = [
  "Nursing Sciences",
  "Medical Laboratory Sciences", 
  "Medicine and Surgery",
  "Community Medicine and Public Health",
  "Human Anatomy",
  "Human Physiology"
];

const LEVELS: Level[] = ["100L", "200L", "300L", "400L", "500L"];

// Sortable Row Component
const SortableRow = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'hsl(var(--muted))' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-muted/50 transition-colors group">
      <TableCell>
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
};

const PositionManagement = () => {
  const [aspirantPositions, setAspirantPositions] = useState<AspirantPosition[]>([]);
  const [votingPositions, setVotingPositions] = useState<VotingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Aspirant position form state
  const [aspirantDialogOpen, setAspirantDialogOpen] = useState(false);
  const [editingAspirant, setEditingAspirant] = useState<AspirantPosition | null>(null);
  const [aspirantForm, setAspirantForm] = useState({
    position_name: "",
    fee: 0,
    min_cgpa: 0,
    eligible_departments: [] as Department[],
    eligible_levels: [] as Level[],
    eligible_gender: null as Gender | null,
    display_order: 1,
  });

  // Voting position form state
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [editingVoting, setEditingVoting] = useState<VotingPosition | null>(null);
  const [votingForm, setVotingForm] = useState({
    position_name: "",
    vote_type: "single" as "single" | "multiple",
    max_selections: 1,
    display_order: 1,
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const [aspirantRes, votingRes] = await Promise.all([
        supabase.from('aspirant_positions').select('*').order('display_order', { ascending: true }),
        supabase.from('voting_positions').select('*').order('display_order')
      ]);

      if (aspirantRes.error) throw aspirantRes.error;
      if (votingRes.error) throw votingRes.error;

      setAspirantPositions(aspirantRes.data || []);
      setVotingPositions(votingRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Aspirant Position CRUD
  const resetAspirantForm = () => {
    setAspirantForm({
      position_name: "",
      fee: 0,
      min_cgpa: 0,
      eligible_departments: [] as Department[],
      eligible_levels: [] as Level[],
      eligible_gender: null,
      display_order: aspirantPositions.length + 1,
    });
    setEditingAspirant(null);
  };

  const openAspirantEdit = (position: AspirantPosition) => {
    setEditingAspirant(position);
    setAspirantForm({
      position_name: position.position_name,
      fee: position.fee,
      min_cgpa: position.min_cgpa || 0,
      eligible_departments: (position.eligible_departments || []) as Department[],
      eligible_levels: (position.eligible_levels || []) as Level[],
      eligible_gender: (position.eligible_gender || null) as Gender | null,
      display_order: (position as any).display_order || 0,
    });
    setAspirantDialogOpen(true);
  };

  const handleSaveAspirantPosition = async () => {
    if (!aspirantForm.position_name || aspirantForm.fee <= 0) {
      toast.error("Position name and fee are required");
      return;
    }

    try {
      if (editingAspirant) {
        const { error } = await supabase
          .from('aspirant_positions')
          .update({
            position_name: aspirantForm.position_name,
            fee: aspirantForm.fee,
            min_cgpa: aspirantForm.min_cgpa,
            eligible_departments: aspirantForm.eligible_departments,
            eligible_levels: aspirantForm.eligible_levels,
            eligible_gender: aspirantForm.eligible_gender,
            display_order: aspirantForm.display_order,
          } as any)
          .eq('id', editingAspirant.id);

        if (error) throw error;

        await logAction({
          action: 'position_update',
          entity_type: 'aspirant_positions',
          entity_id: editingAspirant.id,
          details: { position_name: aspirantForm.position_name }
        });

        toast.success("Position updated");
      } else {
        const { error } = await supabase
          .from('aspirant_positions')
          .insert({
            position_name: aspirantForm.position_name,
            fee: aspirantForm.fee,
            min_cgpa: aspirantForm.min_cgpa,
            eligible_departments: aspirantForm.eligible_departments,
            eligible_levels: aspirantForm.eligible_levels,
            eligible_gender: aspirantForm.eligible_gender,
            is_active: true,
            display_order: aspirantForm.display_order,
          } as any);

        if (error) throw error;

        await logAction({
          action: 'position_create',
          entity_type: 'aspirant_positions',
          details: { position_name: aspirantForm.position_name }
        });

        toast.success("Position created");
      }

      setAspirantDialogOpen(false);
      resetAspirantForm();
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAspirantPosition = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('aspirant_positions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_toggle',
        entity_type: 'aspirant_positions',
        entity_id: id,
        details: { action: 'deleted', name }
      });

      toast.success("Position deleted");
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAspirantPosition = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('aspirant_positions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_toggle',
        entity_type: 'aspirant_positions',
        entity_id: id,
        details: { is_active: !isActive }
      });

      toast.success(isActive ? 'Position closed' : 'Position opened');
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const moveAspirantPosition = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = aspirantPositions.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= aspirantPositions.length) return;

    const currentPosition = aspirantPositions[currentIndex];
    const targetPosition = aspirantPositions[newIndex];
    
    try {
      // Swap display_order values
      const currentOrder = (currentPosition as any).display_order || currentIndex + 1;
      const targetOrder = (targetPosition as any).display_order || newIndex + 1;

      await Promise.all([
        supabase
          .from('aspirant_positions')
          .update({ display_order: targetOrder } as any)
          .eq('id', currentPosition.id),
        supabase
          .from('aspirant_positions')
          .update({ display_order: currentOrder } as any)
          .eq('id', targetPosition.id)
      ]);

      await logAction({
        action: 'position_update',
        entity_type: 'aspirant_positions',
        entity_id: id,
        details: { reorder: true, direction, new_order: targetOrder }
      });

      toast.success("Position order updated");
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Voting Position CRUD
  const resetVotingForm = () => {
    setVotingForm({
      position_name: "",
      vote_type: "single",
      max_selections: 1,
      display_order: votingPositions.length + 1,
    });
    setEditingVoting(null);
  };

  const openVotingEdit = (position: VotingPosition) => {
    setEditingVoting(position);
    setVotingForm({
      position_name: position.position_name,
      vote_type: position.vote_type as "single" | "multiple",
      max_selections: position.max_selections || 1,
      display_order: position.display_order,
    });
    setVotingDialogOpen(true);
  };

  const handleSaveVotingPosition = async () => {
    if (!votingForm.position_name) {
      toast.error("Position name is required");
      return;
    }

    try {
      if (editingVoting) {
        const { error } = await supabase
          .from('voting_positions')
          .update({
            position_name: votingForm.position_name,
            vote_type: votingForm.vote_type,
            max_selections: votingForm.max_selections,
            display_order: votingForm.display_order,
          })
          .eq('id', editingVoting.id);

        if (error) throw error;

        await logAction({
          action: 'position_update',
          entity_type: 'voting_positions',
          entity_id: editingVoting.id,
          details: { position_name: votingForm.position_name }
        });

        toast.success("Position updated");
      } else {
        const { error } = await supabase
          .from('voting_positions')
          .insert({
            position_name: votingForm.position_name,
            vote_type: votingForm.vote_type,
            max_selections: votingForm.max_selections,
            display_order: votingForm.display_order,
            is_active: true,
          });

        if (error) throw error;

        await logAction({
          action: 'position_create',
          entity_type: 'voting_positions',
          details: { position_name: votingForm.position_name }
        });

        toast.success("Position created");
      }

      setVotingDialogOpen(false);
      resetVotingForm();
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteVotingPosition = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('voting_positions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_toggle',
        entity_type: 'voting_positions',
        entity_id: id,
        details: { action: 'deleted', name }
      });

      toast.success("Position deleted");
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleVotingPosition = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('voting_positions')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'position_toggle',
        entity_type: 'voting_positions',
        entity_id: id,
        details: { is_active: !isActive }
      });

      toast.success(isActive ? 'Position closed' : 'Position opened');
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const moveVotingPosition = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = votingPositions.findIndex(p => p.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= votingPositions.length) return;

    const currentPosition = votingPositions[currentIndex];
    const targetPosition = votingPositions[newIndex];
    
    try {
      const currentOrder = currentPosition.display_order || currentIndex + 1;
      const targetOrder = targetPosition.display_order || newIndex + 1;

      await Promise.all([
        supabase
          .from('voting_positions')
          .update({ display_order: targetOrder })
          .eq('id', currentPosition.id),
        supabase
          .from('voting_positions')
          .update({ display_order: currentOrder })
          .eq('id', targetPosition.id)
      ]);

      await logAction({
        action: 'position_update',
        entity_type: 'voting_positions',
        entity_id: id,
        details: { reorder: true, direction, new_order: targetOrder }
      });

      toast.success("Position order updated");
      loadPositions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAspirantDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = aspirantPositions.findIndex(p => p.id === active.id);
    const newIndex = aspirantPositions.findIndex(p => p.id === over.id);
    
    const reordered = arrayMove(aspirantPositions, oldIndex, newIndex);
    setAspirantPositions(reordered);

    // Update display_order in database
    try {
      const updates = reordered.map((pos, index) => 
        supabase.from('aspirant_positions').update({ display_order: index + 1 } as any).eq('id', pos.id)
      );
      await Promise.all(updates);
      
      await logAction({
        action: 'position_update',
        entity_type: 'aspirant_positions',
        entity_id: active.id as string,
        details: { reorder: true, drag_drop: true }
      });
      
      toast.success("Position order updated");
    } catch (error: any) {
      toast.error(error.message);
      loadPositions();
    }
  };

  const handleVotingDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = votingPositions.findIndex(p => p.id === active.id);
    const newIndex = votingPositions.findIndex(p => p.id === over.id);
    
    const reordered = arrayMove(votingPositions, oldIndex, newIndex);
    setVotingPositions(reordered);

    // Update display_order in database
    try {
      const updates = reordered.map((pos, index) => 
        supabase.from('voting_positions').update({ display_order: index + 1 }).eq('id', pos.id)
      );
      await Promise.all(updates);
      
      await logAction({
        action: 'position_update',
        entity_type: 'voting_positions',
        entity_id: active.id as string,
        details: { reorder: true, drag_drop: true }
      });
      
      toast.success("Position order updated");
    } catch (error: any) {
      toast.error(error.message);
      loadPositions();
    }
  };

  const toggleDepartment = (dept: Department) => {
    setAspirantForm(prev => ({
      ...prev,
      eligible_departments: prev.eligible_departments.includes(dept)
        ? prev.eligible_departments.filter(d => d !== dept)
        : [...prev.eligible_departments, dept]
    }));
  };

  const toggleLevel = (level: Level) => {
    setAspirantForm(prev => ({
      ...prev,
      eligible_levels: prev.eligible_levels.includes(level)
        ? prev.eligible_levels.filter(l => l !== level)
        : [...prev.eligible_levels, level]
    }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Position Management</CardTitle>
            <CardDescription>Manage aspirant application and voting positions with hierarchy ordering</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="aspirant">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="aspirant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Aspirant Positions
                </TabsTrigger>
                <TabsTrigger value="voting" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Voting Positions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="aspirant" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Use the arrows to arrange positions by hierarchy (e.g., President first, then Vice President)
                  </p>
                  <Dialog open={aspirantDialogOpen} onOpenChange={(open) => {
                    setAspirantDialogOpen(open);
                    if (!open) resetAspirantForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Position
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingAspirant ? "Edit" : "Add"} Aspirant Position</DialogTitle>
                        <DialogDescription>Configure position requirements and eligibility</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Position Name</Label>
                            <Input 
                              value={aspirantForm.position_name}
                              onChange={(e) => setAspirantForm(prev => ({ ...prev, position_name: e.target.value }))}
                              placeholder="e.g., President"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Application Fee (₦)</Label>
                            <Input 
                              type="number"
                              value={aspirantForm.fee}
                              onChange={(e) => setAspirantForm(prev => ({ ...prev, fee: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum CGPA</Label>
                            <Input 
                              type="number"
                              step="0.01"
                              value={aspirantForm.min_cgpa}
                              onChange={(e) => setAspirantForm(prev => ({ ...prev, min_cgpa: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input 
                              type="number"
                              min={1}
                              value={aspirantForm.display_order}
                              onChange={(e) => setAspirantForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Gender Restriction</Label>
                            <Select 
                              value={aspirantForm.eligible_gender || "none"}
                              onValueChange={(v) => setAspirantForm(prev => ({ ...prev, eligible_gender: v === "none" ? null : v as Gender }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="none">No restriction</SelectItem>
                                <SelectItem value="male">Male only</SelectItem>
                                <SelectItem value="female">Female only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Eligible Departments</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {DEPARTMENTS.map(dept => (
                              <label key={dept} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                                <input 
                                  type="checkbox"
                                  checked={aspirantForm.eligible_departments.includes(dept)}
                                  onChange={() => toggleDepartment(dept)}
                                  className="rounded"
                                />
                                {dept}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Eligible Levels</Label>
                          <div className="flex flex-wrap gap-2">
                            {LEVELS.map(level => (
                              <label key={level} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-md hover:bg-muted transition-colors">
                                <input 
                                  type="checkbox"
                                  checked={aspirantForm.eligible_levels.includes(level)}
                                  onChange={() => toggleLevel(level)}
                                  className="rounded"
                                />
                                {level}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAspirantDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAspirantPosition}>Save Position</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Order</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Min CGPA</TableHead>
                        <TableHead>Eligible Levels</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aspirantPositions.map((position, index) => (
                        <TableRow key={position.id} className="hover:bg-muted/50 transition-colors group">
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{(position as any).display_order || index + 1}</span>
                              <div className="flex flex-col ml-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => moveAspirantPosition(position.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => moveAspirantPosition(position.id, 'down')}
                                  disabled={index === aspirantPositions.length - 1}
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{position.position_name}</TableCell>
                          <TableCell>₦{position.fee.toLocaleString()}</TableCell>
                          <TableCell>{position.min_cgpa}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {position.eligible_levels.map((level) => (
                                <Badge key={level} variant="outline" className="text-xs">{level}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={position.is_active || false}
                              onCheckedChange={() => toggleAspirantPosition(position.id, position.is_active || false)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => openAspirantEdit(position)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAspirantPosition(position.id, position.position_name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {aspirantPositions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No aspirant positions created yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="voting" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Arrange voting positions in the order they should appear on the ballot
                  </p>
                  <Dialog open={votingDialogOpen} onOpenChange={(open) => {
                    setVotingDialogOpen(open);
                    if (!open) resetVotingForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Position
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingVoting ? "Edit" : "Add"} Voting Position</DialogTitle>
                        <DialogDescription>Configure voting position settings</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Position Name</Label>
                          <Input 
                            value={votingForm.position_name}
                            onChange={(e) => setVotingForm(prev => ({ ...prev, position_name: e.target.value }))}
                            placeholder="e.g., President"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Vote Type</Label>
                            <Select 
                              value={votingForm.vote_type}
                              onValueChange={(v) => setVotingForm(prev => ({ ...prev, vote_type: v as "single" | "multiple" }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="single">Single Selection</SelectItem>
                                <SelectItem value="multiple">Multiple Selection</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Selections</Label>
                            <Input 
                              type="number"
                              min={1}
                              value={votingForm.max_selections}
                              onChange={(e) => setVotingForm(prev => ({ ...prev, max_selections: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Display Order</Label>
                          <Input 
                            type="number"
                            min={1}
                            value={votingForm.display_order}
                            onChange={(e) => setVotingForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setVotingDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveVotingPosition}>Save Position</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Order</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Vote Type</TableHead>
                        <TableHead>Max Selections</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {votingPositions.map((position, index) => (
                        <TableRow key={position.id} className="hover:bg-muted/50 transition-colors group">
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{position.display_order}</span>
                              <div className="flex flex-col ml-1">
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveVotingPosition(position.id, 'up')} disabled={index === 0}><ArrowUp className="h-3 w-3" /></Button>
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveVotingPosition(position.id, 'down')} disabled={index === votingPositions.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{position.position_name}</TableCell>
                          <TableCell><Badge variant={position.vote_type === 'single' ? 'default' : 'secondary'}>{position.vote_type}</Badge></TableCell>
                          <TableCell>{position.max_selections}</TableCell>
                          <TableCell><Switch checked={position.is_active || false} onCheckedChange={() => toggleVotingPosition(position.id, position.is_active || false)} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => openVotingEdit(position)}><Pencil className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteVotingPosition(position.id, position.position_name)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {votingPositions.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No voting positions created yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PositionManagement;