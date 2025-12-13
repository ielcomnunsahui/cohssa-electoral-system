import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ScrollArea } from "@/components/ui/scroll-area";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManifestoDialogOpen, setIsManifestoDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const { logAction } = useAuditLog();
  
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [positionId, setPositionId] = useState("");
  const [department, setDepartment] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCandidates();
    loadPositions();
  }, []);

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*, voting_positions(position_name)')
      .order('name');
    
    if (!error && data) {
      setCandidates(data);
    }
  };

  const loadPositions = async () => {
    const { data, error } = await supabase
      .from('voting_positions')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (!error && data) {
      setPositions(data);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCandidate = async () => {
    if (!name || !matric || !positionId || !department || !photoPreview) {
      toast.error("Please fill all fields and upload a photo");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .insert({
          name,
          matric,
          voting_position_id: positionId,
          department: department as any,
          photo_url: photoPreview,
          manifesto: manifesto || null
        });

      if (error) throw error;

      await logAction({
        action: 'candidate_add',
        entity_type: 'candidates',
        details: { name, matric, position_id: positionId }
      });

      toast.success("Candidate added successfully");
      setIsDialogOpen(false);
      resetForm();
      loadCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (id: string, candidateName: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'candidate_delete',
        entity_type: 'candidates',
        entity_id: id,
        details: { name: candidateName }
      });

      toast.success("Candidate deleted");
      loadCandidates();
    } catch (error: any) {
      toast.error("Failed to delete candidate");
    }
  };

  const openManifestoEditor = (candidate: any) => {
    setEditingCandidate(candidate);
    setManifesto(candidate.manifesto || "");
    setIsManifestoDialogOpen(true);
  };

  const handleSaveManifesto = async () => {
    if (!editingCandidate) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ manifesto })
        .eq('id', editingCandidate.id);

      if (error) throw error;

      await logAction({
        action: 'candidate_edit',
        entity_type: 'candidates',
        entity_id: editingCandidate.id,
        details: { name: editingCandidate.name, action: 'manifesto_updated' }
      });

      toast.success("Manifesto updated successfully");
      setIsManifestoDialogOpen(false);
      setEditingCandidate(null);
      loadCandidates();
    } catch (error: any) {
      toast.error("Failed to update manifesto");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setMatric("");
    setPositionId("");
    setDepartment("");
    setManifesto("");
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Candidate Management</CardTitle>
              <CardDescription>Manage election candidates and their manifestos</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Add New Candidate</DialogTitle>
                  <DialogDescription>Enter candidate details below</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Photo (Max 2MB)</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {photoPreview && (
                        <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto" />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Matric Number</Label>
                        <Input value={matric} onChange={(e) => setMatric(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={positionId} onValueChange={setPositionId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {positions.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>{pos.position_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="Nursing Sciences">Nursing Sciences</SelectItem>
                            <SelectItem value="Medical Laboratory Sciences">Medical Laboratory Sciences</SelectItem>
                            <SelectItem value="Medicine and Surgery">Medicine and Surgery</SelectItem>
                            <SelectItem value="Community Medicine and Public Health">Community Medicine and Public Health</SelectItem>
                            <SelectItem value="Human Anatomy">Human Anatomy</SelectItem>
                            <SelectItem value="Human Physiology">Human Physiology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Manifesto (Optional)</Label>
                      <Textarea 
                        value={manifesto} 
                        onChange={(e) => setManifesto(e.target.value)}
                        placeholder="Enter candidate's manifesto..."
                        rows={4}
                      />
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-shrink-0 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCandidate} disabled={loading}>
                    {loading ? "Adding..." : "Add Candidate"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No candidates yet</p>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Matric</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manifesto</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <img
                            src={candidate.photo_url}
                            alt={candidate.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell className="font-mono text-sm">{candidate.matric}</TableCell>
                        <TableCell>{candidate.voting_positions?.position_name}</TableCell>
                        <TableCell>{candidate.department}</TableCell>
                        <TableCell>
                          <span className={`text-xs ${candidate.manifesto ? 'text-success' : 'text-muted-foreground'}`}>
                            {candidate.manifesto ? 'Has manifesto' : 'No manifesto'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openManifestoEditor(candidate)}
                              title="Edit Manifesto"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
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

        {/* Manifesto Editor Dialog */}
        <Dialog open={isManifestoDialogOpen} onOpenChange={setIsManifestoDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Manifesto</DialogTitle>
              <DialogDescription>
                {editingCandidate?.name} - {editingCandidate?.voting_positions?.position_name}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <Textarea 
                  value={manifesto} 
                  onChange={(e) => setManifesto(e.target.value)}
                  placeholder="Enter candidate's manifesto..."
                  rows={12}
                  className="min-h-[250px]"
                />
              </div>
            </ScrollArea>
            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsManifestoDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveManifesto} disabled={loading}>
                {loading ? "Saving..." : "Save Manifesto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CandidateManagement;