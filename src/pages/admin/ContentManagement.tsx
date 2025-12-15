import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminTour } from "@/hooks/useAdminTour";
import { 
  Plus, Edit, Trash2, Loader2, Users, Crown, Scale, GraduationCap, 
  Building, Phone, Mail, Upload, Save
} from "lucide-react";

const ContentManagement = () => {
  const { startTour } = useAdminTour();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("leaders");
  
  // Data states
  const [leaders, setLeaders] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [senate, setSenate] = useState<any[]>([]);
  const [alumni, setAlumni] = useState<any[]>([]);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [leadersRes, execRes, senateRes, alumniRes] = await Promise.all([
        supabase.from('university_leaders').select('*').order('display_order'),
        supabase.from('cohssa_executives').select('*').order('display_order'),
        supabase.from('cohssa_senate').select('*').order('display_order'),
        supabase.from('cohssa_alumni').select('*').order('administration_number')
      ]);

      if (leadersRes.data) setLeaders(leadersRes.data);
      if (execRes.data) setExecutives(execRes.data);
      if (senateRes.data) setSenate(senateRes.data);
      if (alumniRes.data) setAlumni(alumniRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type: string) => {
    setEditingItem(null);
    setFormData(getDefaultFormData(type));
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const getDefaultFormData = (type: string) => {
    switch (type) {
      case 'leaders':
        return { name: '', position: '', faculty: '', photo_url: '', display_order: 0 };
      case 'executives':
        return { name: '', position: '', department: '', level: '', contact: '', photo_url: '', display_order: 0 };
      case 'senate':
        return { name: '', position: '', department: '', level: '', contact: '', photo_url: '', display_order: 0 };
      case 'alumni':
        return { name: '', position: '', department: '', graduation_year: '', current_workplace: '', phone: '', email: '', photo_url: '', administration_number: 1 };
      default:
        return {};
    }
  };

  const getTableName = (type: string) => {
    switch (type) {
      case 'leaders': return 'university_leaders';
      case 'executives': return 'cohssa_executives';
      case 'senate': return 'cohssa_senate';
      case 'alumni': return 'cohssa_alumni';
      default: return 'university_leaders';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tableName = getTableName(activeTab) as any;
      
      if (editingItem) {
        const { error } = await supabase
          .from(tableName)
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success("Updated successfully");
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert(formData);
        if (error) throw error;
        toast.success("Added successfully");
      }
      
      setDialogOpen(false);
      fetchAllData();
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
      const tableName = getTableName(activeTab) as any;
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      toast.success("Deleted successfully");
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
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
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage university leaders, executives, senate, and alumni profiles</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="leaders" className="gap-2">
              <Building className="h-4 w-4" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="executives" className="gap-2">
              <Crown className="h-4 w-4" />
              Executives
            </TabsTrigger>
            <TabsTrigger value="senate" className="gap-2">
              <Scale className="h-4 w-4" />
              Senate
            </TabsTrigger>
            <TabsTrigger value="alumni" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Alumni
            </TabsTrigger>
          </TabsList>

          {/* University Leaders */}
          <TabsContent value="leaders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>University Leaders</CardTitle>
                  <CardDescription>Vice Chancellor, Deans, and other university leaders</CardDescription>
                </div>
                <Button onClick={() => handleAdd('leaders')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Leader
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader) => (
                      <TableRow key={leader.id}>
                        <TableCell>
                          {leader.photo_url ? (
                            <img src={leader.photo_url} alt={leader.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{leader.name}</TableCell>
                        <TableCell>{leader.position}</TableCell>
                        <TableCell>{leader.faculty || '-'}</TableCell>
                        <TableCell>{leader.display_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(leader)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(leader.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {leaders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No leaders added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executives */}
          <TabsContent value="executives">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Executives</CardTitle>
                  <CardDescription>16-member executive council</CardDescription>
                </div>
                <Button onClick={() => handleAdd('executives')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Executive
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executives.map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell>
                          {exec.photo_url ? (
                            <img src={exec.photo_url} alt={exec.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{exec.name}</TableCell>
                        <TableCell>{exec.position}</TableCell>
                        <TableCell>{exec.department || '-'}</TableCell>
                        <TableCell>{exec.level || '-'}</TableCell>
                        <TableCell>{exec.contact || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(exec)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(exec.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {executives.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No executives added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Senate */}
          <TabsContent value="senate">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Senate</CardTitle>
                  <CardDescription>10-member legislative body</CardDescription>
                </div>
                <Button onClick={() => handleAdd('senate')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Senator
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senate.map((senator) => (
                      <TableRow key={senator.id}>
                        <TableCell>
                          {senator.photo_url ? (
                            <img src={senator.photo_url} alt={senator.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{senator.name}</TableCell>
                        <TableCell>{senator.position}</TableCell>
                        <TableCell>{senator.department || '-'}</TableCell>
                        <TableCell>{senator.level || '-'}</TableCell>
                        <TableCell>{senator.contact || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(senator)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(senator.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {senate.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No senators added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alumni */}
          <TabsContent value="alumni">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>COHSSA Alumni</CardTitle>
                  <CardDescription>Past presidents and senate leaders</CardDescription>
                </div>
                <Button onClick={() => handleAdd('alumni')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Alumni
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Administration</TableHead>
                      <TableHead>Graduation Year</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alumni.map((alum) => (
                      <TableRow key={alum.id}>
                        <TableCell>
                          {alum.photo_url ? (
                            <img src={alum.photo_url} alt={alum.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{alum.name}</TableCell>
                        <TableCell>{alum.position}</TableCell>
                        <TableCell><Badge>{alum.administration_number}th Admin</Badge></TableCell>
                        <TableCell>{alum.graduation_year || '-'}</TableCell>
                        <TableCell>{alum.phone || alum.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(alum)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleDelete(alum.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {alumni.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No alumni added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} {activeTab === 'leaders' ? 'Leader' : activeTab === 'executives' ? 'Executive' : activeTab === 'senate' ? 'Senator' : 'Alumni'}</DialogTitle>
              <DialogDescription>Fill in the details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., President, Dean"
                  />
                </div>
                {activeTab === 'leaders' && (
                  <div className="space-y-2">
                    <Label>Faculty</Label>
                    <Input
                      value={formData.faculty || ''}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      placeholder="e.g., Health Sciences"
                    />
                  </div>
                )}
                {(activeTab === 'executives' || activeTab === 'senate') && (
                  <>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g., Nursing Sciences"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Input
                        value={formData.level || ''}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        placeholder="e.g., 400L"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input
                        value={formData.contact || ''}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                  </>
                )}
                {activeTab === 'alumni' && (
                  <>
                    <div className="space-y-2">
                      <Label>Administration Number</Label>
                      <Input
                        type="number"
                        value={formData.administration_number || 1}
                        onChange={(e) => setFormData({ ...formData, administration_number: parseInt(e.target.value) })}
                        placeholder="e.g., 1, 2, 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Department"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Year</Label>
                      <Input
                        value={formData.graduation_year || ''}
                        onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                        placeholder="e.g., 2023"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Workplace</Label>
                      <Input
                        value={formData.current_workplace || ''}
                        onChange={(e) => setFormData({ ...formData, current_workplace: e.target.value })}
                        placeholder="Current organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Email address"
                      />
                    </div>
                  </>
                )}
                <div className="col-span-2 space-y-2">
                  <Label>Photo URL</Label>
                  <Input
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {activeTab !== 'alumni' && (
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                )}
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

export default ContentManagement;
