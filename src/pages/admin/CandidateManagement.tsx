import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, FileText, Users, Award, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuditLog } from "@/hooks/useAuditLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SEO from "@/components/SEO";
import { CandidateForm } from "@/components/admin/CandidateForm";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const { logAction } = useAuditLog();
  
  // Form states
  const [name, setName] = useState("");
  const [matric, setMatric] = useState("");
  const [positionId, setPositionId] = useState("");
  const [department, setDepartment] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [formTab, setFormTab] = useState("basic");

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCandidates(), loadPositions()]);
      setLoading(false);
    };
    init();
  }, []);

  const loadCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*, positions(title)')
        .order('name');
      
      if (error) {
        console.error('Error loading candidates:', error);
        toast.error('Failed to load candidates');
        return;
      }
      
      if (data) {
        console.log('Loaded candidates:', data.length);
        setCandidates(data);
      }
    } catch (err) {
      console.error('Exception loading candidates:', err);
    }
  };

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) {
        console.error('Error loading positions:', error);
        return;
      }
      
      if (data) {
        setPositions(data);
      }
    } catch (err) {
      console.error('Exception loading positions:', err);
    }
  };

  const handleAddCandidate = async () => {
    if (!name || !matric || !positionId || !department) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .insert({
          name,
          matric,
          position_id: positionId,
          department,
          photo_url: photoPreview || null,
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

  const handleEditCandidate = async () => {
    if (!editingCandidate) return;
    if (!name || !matric || !positionId || !department) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({
          name,
          matric,
          position_id: positionId,
          department,
          photo_url: photoPreview || editingCandidate.photo_url || null,
          manifesto: manifesto || null
        })
        .eq('id', editingCandidate.id);

      if (error) throw error;

      await logAction({
        action: 'candidate_edit',
        entity_type: 'candidates',
        entity_id: editingCandidate.id,
        details: { name, matric, position_id: positionId }
      });

      toast.success("Candidate updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      setEditingCandidate(null);
      loadCandidates();
    } catch (error: any) {
      toast.error(error.message || "Failed to update candidate");
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

  const openEditDialog = (candidate: any) => {
    setEditingCandidate(candidate);
    setName(candidate.name || "");
    setMatric(candidate.matric || "");
    setPositionId(candidate.position_id || "");
    setDepartment(candidate.department || "");
    setManifesto(candidate.manifesto || "");
    setPhotoPreview(candidate.photo_url || "");
    setFormTab("basic");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setMatric("");
    setPositionId("");
    setDepartment("");
    setManifesto("");
    setPhotoPreview("");
    setFormTab("basic");
  };

  return (
    <AdminLayout>
      <SEO 
        title="Candidate Management" 
        description="Manage election candidates, their manifestos, and information for COHSSA elections."
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Candidate Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage election candidates and their manifestos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">{candidates.length}</span>
              <span className="text-sm text-muted-foreground">Candidates</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Candidate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Award className="h-5 w-5 text-primary" />
                    Add New Candidate
                  </DialogTitle>
                  <DialogDescription>Fill in the candidate details below. Fields marked with * are required.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 overflow-y-auto">
                  <div className="px-6 pb-4">
                    <CandidateForm
                      name={name}
                      setName={setName}
                      matric={matric}
                      setMatric={setMatric}
                      positionId={positionId}
                      setPositionId={setPositionId}
                      department={department}
                      setDepartment={setDepartment}
                      manifesto={manifesto}
                      setManifesto={setManifesto}
                      photoPreview={photoPreview}
                      setPhotoPreview={setPhotoPreview}
                      formTab={formTab}
                      setFormTab={setFormTab}
                      positions={positions}
                      isEdit={false}
                    />
                  </div>
                </ScrollArea>
                <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCandidate} disabled={loading} className="gap-2">
                    {loading ? "Adding..." : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Candidate
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Candidates Table */}
        <Card className="animate-fade-in border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {candidates.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No candidates yet</h3>
                <p className="text-muted-foreground mb-4">Add your first candidate to get started</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Candidate
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-16">Photo</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Matric</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manifesto</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate, index) => (
                      <TableRow 
                        key={candidate.id} 
                        className="hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <Avatar className="h-12 w-12 border-2 border-muted">
                            <AvatarImage src={candidate.photo_url} alt={candidate.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {candidate.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{candidate.name}</p>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{candidate.matric}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {candidate.positions?.title || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{candidate.department}</TableCell>
                        <TableCell>
                          {candidate.manifesto ? (
                            <Badge className="bg-green-500/10 text-green-600 border-0 gap-1">
                              <FileText className="h-3 w-3" />
                              Has manifesto
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              No manifesto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(candidate)}
                              title="Edit Candidate"
                              className="gap-1"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                              title="Delete Candidate"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Edit Candidate Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { 
          setIsEditDialogOpen(open); 
          if (!open) { 
            resetForm(); 
            setEditingCandidate(null); 
          } 
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Pencil className="h-5 w-5 text-primary" />
                Edit Candidate
              </DialogTitle>
              <DialogDescription>
                Update the candidate details below. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="px-6 pb-4">
                <CandidateForm
                  name={name}
                  setName={setName}
                  matric={matric}
                  setMatric={setMatric}
                  positionId={positionId}
                  setPositionId={setPositionId}
                  department={department}
                  setDepartment={setDepartment}
                  manifesto={manifesto}
                  setManifesto={setManifesto}
                  photoPreview={photoPreview}
                  setPhotoPreview={setPhotoPreview}
                  formTab={formTab}
                  setFormTab={setFormTab}
                  positions={positions}
                  isEdit={true}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditCandidate} disabled={loading} className="gap-2">
                {loading ? "Saving..." : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default CandidateManagement;
